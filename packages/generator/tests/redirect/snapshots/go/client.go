package pachca

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"
)

type authTransport struct {
	token string
	base  http.RoundTripper
}

func (t *authTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	req.Header.Set("Authorization", "Bearer "+t.token)
	return t.base.RoundTrip(req)
}

const maxRetries = 3

func doWithRetry(client *http.Client, req *http.Request) (*http.Response, error) {
	for attempt := 0; ; attempt++ {
		if attempt > 0 && req.GetBody != nil {
			req.Body, _ = req.GetBody()
		}
		resp, err := client.Do(req)
		if err != nil {
			return nil, err
		}
		if resp.StatusCode == http.StatusTooManyRequests && attempt < maxRetries {
			resp.Body.Close()
			delay := time.Duration(1<<uint(attempt)) * time.Second
			if ra := resp.Header.Get("Retry-After"); ra != "" {
				if secs, err := strconv.Atoi(ra); err == nil {
					delay = time.Duration(secs) * time.Second
				}
			}
			time.Sleep(delay)
			continue
		}
		return resp, nil
	}
}

type CommonService interface {
	DownloadExport(ctx context.Context, id int32) (string, error)
}

type CommonServiceStub struct{}

func (s *CommonServiceStub) DownloadExport(ctx context.Context, id int32) (string, error) {
	return "", fmt.Errorf("Common.downloadExport is not implemented")
}

type CommonServiceImpl struct {
	baseURL string
	client  *http.Client
}

func (s *CommonServiceImpl) DownloadExport(ctx context.Context, id int32) (string, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", fmt.Sprintf("%s/exports/%v", s.baseURL, id), nil)
	if err != nil {
		return "", err
	}
	resp, err := doWithRetry(s.client, req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	switch resp.StatusCode {
	case http.StatusFound:
		location := resp.Header.Get("Location")
		if location == "" {
			return "", errors.New("missing Location header in redirect response")
		}
		return location, nil
	case http.StatusUnauthorized:
		var e OAuthError
		json.NewDecoder(resp.Body).Decode(&e)
		return "", &e
	default:
		var e ApiError
		json.NewDecoder(resp.Body).Decode(&e)
		return "", &e
	}
}

type PachcaClient struct {
	Common CommonService
}

type clientConfig struct {
	baseURL string
	common CommonService
}

type ClientOption func(*clientConfig)

const DefaultBaseURL = "https://api.pachca.com/api/shared/v1"

func WithBaseURL(baseURL string) ClientOption {
	return func(cfg *clientConfig) { cfg.baseURL = baseURL }
}

func WithCommon(service CommonService) ClientOption {
	return func(cfg *clientConfig) { cfg.common = service }
}

func NewPachcaClient(token string, opts ...ClientOption) *PachcaClient {
	cfg := clientConfig{baseURL: DefaultBaseURL}
	for _, opt := range opts {
		opt(&cfg)
	}
	client := &http.Client{
		Transport: &authTransport{token: token, base: http.DefaultTransport},
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			return http.ErrUseLastResponse
		},
	}
	return &PachcaClient{
		Common: func() CommonService { if cfg.common != nil { return cfg.common }; return &CommonServiceImpl{baseURL: cfg.baseURL, client: client} }(),
	}
}
