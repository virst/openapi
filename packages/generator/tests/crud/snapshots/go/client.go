package pachca

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
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

type ChatsService interface {
	ListChats(ctx context.Context, params *ListChatsParams) (*ListChatsResponse, error)
	ListChatsAll(ctx context.Context, params *ListChatsParams) ([]Chat, error)
	GetChat(ctx context.Context, id int32) (*Chat, error)
	CreateChat(ctx context.Context, request ChatCreateRequest) (*Chat, error)
	UpdateChat(ctx context.Context, id int32, request ChatUpdateRequest) (*Chat, error)
	ArchiveChat(ctx context.Context, id int32) error
	DeleteChat(ctx context.Context, id int32) error
}

type ChatsServiceStub struct{}

func (s *ChatsServiceStub) ListChats(ctx context.Context, params *ListChatsParams) (*ListChatsResponse, error) {
	return nil, fmt.Errorf("Chats.listChats is not implemented")
}

func (s *ChatsServiceStub) ListChatsAll(ctx context.Context, params *ListChatsParams) ([]Chat, error) {
	return nil, fmt.Errorf("Chats.listChatsAll is not implemented")
}

func (s *ChatsServiceStub) GetChat(ctx context.Context, id int32) (*Chat, error) {
	return nil, fmt.Errorf("Chats.getChat is not implemented")
}

func (s *ChatsServiceStub) CreateChat(ctx context.Context, request ChatCreateRequest) (*Chat, error) {
	return nil, fmt.Errorf("Chats.createChat is not implemented")
}

func (s *ChatsServiceStub) UpdateChat(ctx context.Context, id int32, request ChatUpdateRequest) (*Chat, error) {
	return nil, fmt.Errorf("Chats.updateChat is not implemented")
}

func (s *ChatsServiceStub) ArchiveChat(ctx context.Context, id int32) error {
	return fmt.Errorf("Chats.archiveChat is not implemented")
}

func (s *ChatsServiceStub) DeleteChat(ctx context.Context, id int32) error {
	return fmt.Errorf("Chats.deleteChat is not implemented")
}

type ChatsServiceImpl struct {
	baseURL string
	client  *http.Client
}

func (s *ChatsServiceImpl) ListChats(ctx context.Context, params *ListChatsParams) (*ListChatsResponse, error) {
	u, err := url.Parse(fmt.Sprintf("%s/chats", s.baseURL))
	if err != nil {
		return nil, err
	}
	q := u.Query()
	if params != nil && params.Availability != nil {
		q.Set("availability", string(*params.Availability))
	}
	if params != nil && params.Limit != nil {
		q.Set("limit", fmt.Sprintf("%v", *params.Limit))
	}
	if params != nil && params.Cursor != nil {
		q.Set("cursor", fmt.Sprintf("%v", *params.Cursor))
	}
	if params != nil && params.SortField != nil {
		q.Set("sort[field]", fmt.Sprintf("%v", *params.SortField))
	}
	if params != nil && params.SortOrder != nil {
		q.Set("sort[order]", string(*params.SortOrder))
	}
	u.RawQuery = q.Encode()
	req, err := http.NewRequestWithContext(ctx, "GET", u.String(), nil)
	if err != nil {
		return nil, err
	}
	resp, err := doWithRetry(s.client, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	switch resp.StatusCode {
	case http.StatusOK:
		var result ListChatsResponse
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			return nil, err
		}
		return &result, nil
	case http.StatusUnauthorized:
		var e OAuthError
		json.NewDecoder(resp.Body).Decode(&e)
		return nil, &e
	default:
		var e ApiError
		json.NewDecoder(resp.Body).Decode(&e)
		return nil, &e
	}
}

func (s *ChatsServiceImpl) ListChatsAll(ctx context.Context, params *ListChatsParams) ([]Chat, error) {
	if params == nil {
		params = &ListChatsParams{}
	}
	var items []Chat
	var cursor *string
	for {
		params.Cursor = cursor
		result, err := s.ListChats(ctx, params)
		if err != nil {
			return nil, err
		}
		items = append(items, result.Data...)
		if result.Meta == nil || result.Meta.Paginate == nil || result.Meta.Paginate.NextPage == nil {
			return items, nil
		}
		cursor = result.Meta.Paginate.NextPage
	}
}

func (s *ChatsServiceImpl) GetChat(ctx context.Context, id int32) (*Chat, error) {
	req, err := http.NewRequestWithContext(ctx, "GET", fmt.Sprintf("%s/chats/%v", s.baseURL, id), nil)
	if err != nil {
		return nil, err
	}
	resp, err := doWithRetry(s.client, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	switch resp.StatusCode {
	case http.StatusOK:
		var result struct {
			Data Chat `json:"data"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			return nil, err
		}
		return &result.Data, nil
	case http.StatusUnauthorized:
		var e OAuthError
		json.NewDecoder(resp.Body).Decode(&e)
		return nil, &e
	default:
		var e ApiError
		json.NewDecoder(resp.Body).Decode(&e)
		return nil, &e
	}
}

func (s *ChatsServiceImpl) CreateChat(ctx context.Context, request ChatCreateRequest) (*Chat, error) {
	body, err := json.Marshal(request)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, "POST", fmt.Sprintf("%s/chats", s.baseURL), bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := doWithRetry(s.client, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	switch resp.StatusCode {
	case http.StatusCreated:
		var result struct {
			Data Chat `json:"data"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			return nil, err
		}
		return &result.Data, nil
	case http.StatusUnauthorized:
		var e OAuthError
		json.NewDecoder(resp.Body).Decode(&e)
		return nil, &e
	default:
		var e ApiError
		json.NewDecoder(resp.Body).Decode(&e)
		return nil, &e
	}
}

func (s *ChatsServiceImpl) UpdateChat(ctx context.Context, id int32, request ChatUpdateRequest) (*Chat, error) {
	body, err := json.Marshal(request)
	if err != nil {
		return nil, err
	}
	req, err := http.NewRequestWithContext(ctx, "PUT", fmt.Sprintf("%s/chats/%v", s.baseURL, id), bytes.NewReader(body))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := doWithRetry(s.client, req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	switch resp.StatusCode {
	case http.StatusOK:
		var result struct {
			Data Chat `json:"data"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			return nil, err
		}
		return &result.Data, nil
	case http.StatusUnauthorized:
		var e OAuthError
		json.NewDecoder(resp.Body).Decode(&e)
		return nil, &e
	default:
		var e ApiError
		json.NewDecoder(resp.Body).Decode(&e)
		return nil, &e
	}
}

func (s *ChatsServiceImpl) ArchiveChat(ctx context.Context, id int32) error {
	req, err := http.NewRequestWithContext(ctx, "PUT", fmt.Sprintf("%s/chats/%v/archive", s.baseURL, id), nil)
	if err != nil {
		return err
	}
	resp, err := doWithRetry(s.client, req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	switch resp.StatusCode {
	case http.StatusNoContent:
		return nil
	case http.StatusUnauthorized:
		var e OAuthError
		json.NewDecoder(resp.Body).Decode(&e)
		return &e
	default:
		var e ApiError
		json.NewDecoder(resp.Body).Decode(&e)
		return &e
	}
}

func (s *ChatsServiceImpl) DeleteChat(ctx context.Context, id int32) error {
	req, err := http.NewRequestWithContext(ctx, "DELETE", fmt.Sprintf("%s/chats/%v", s.baseURL, id), nil)
	if err != nil {
		return err
	}
	resp, err := doWithRetry(s.client, req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	switch resp.StatusCode {
	case http.StatusNoContent:
		return nil
	case http.StatusUnauthorized:
		var e OAuthError
		json.NewDecoder(resp.Body).Decode(&e)
		return &e
	default:
		var e ApiError
		json.NewDecoder(resp.Body).Decode(&e)
		return &e
	}
}

type PachcaClient struct {
	Chats ChatsService
}

type clientConfig struct {
	baseURL string
	chats ChatsService
}

type ClientOption func(*clientConfig)

const DefaultBaseURL = "https://api.pachca.com/api/shared/v1"

func WithBaseURL(baseURL string) ClientOption {
	return func(cfg *clientConfig) { cfg.baseURL = baseURL }
}

func WithChats(service ChatsService) ClientOption {
	return func(cfg *clientConfig) { cfg.chats = service }
}

func NewPachcaClient(token string, opts ...ClientOption) *PachcaClient {
	cfg := clientConfig{baseURL: DefaultBaseURL}
	for _, opt := range opts {
		opt(&cfg)
	}
	client := &http.Client{
		Transport: &authTransport{token: token, base: http.DefaultTransport},
	}
	return &PachcaClient{
		Chats: func() ChatsService { if cfg.chats != nil { return cfg.chats }; return &ChatsServiceImpl{baseURL: cfg.baseURL, client: client} }(),
	}
}
