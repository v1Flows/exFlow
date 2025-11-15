package auth

import (
	"context"
	"fmt"
	"time"

	"github.com/JustLABv1/justflow/services/backend/config"
	"github.com/JustLABv1/justflow/services/backend/pkg/models"
	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/google/uuid"
	"golang.org/x/oauth2"
)

// OIDCManager handles OIDC operations
type OIDCManager struct {
	provider     *oidc.Provider
	oauth2Cfg    *oauth2.Config
	verifier     *oidc.IDTokenVerifier
	providerName string
}

// OIDCUserInfo contains user information from OIDC provider
type OIDCUserInfo struct {
	Sub               string `json:"sub"` // Subject (provider's unique user ID)
	Email             string `json:"email"`
	EmailVerified     bool   `json:"email_verified"`
	Name              string `json:"name"`
	GivenName         string `json:"given_name"`
	FamilyName        string `json:"family_name"`
	PreferredUsername string `json:"preferred_username"`
}

// NewOIDCManager creates a new OIDC manager for a specific provider
func NewOIDCManager(ctx context.Context, providerName string) (*OIDCManager, error) {
	providerCfg, exists := config.Config.OIDC.Providers[providerName]
	if !exists {
		return nil, fmt.Errorf("OIDC provider %s not configured", providerName)
	}

	// Create OIDC provider
	provider, err := oidc.NewProvider(ctx, providerCfg.DiscoveryURL)
	if err != nil {
		return nil, fmt.Errorf("failed to create OIDC provider: %w", err)
	}

	// Set default scopes if not provided
	scopes := providerCfg.Scopes
	if len(scopes) == 0 {
		scopes = []string{oidc.ScopeOpenID, "profile", "email"}
	}

	// Create OAuth2 config
	oauth2Cfg := &oauth2.Config{
		ClientID:     providerCfg.ClientID,
		ClientSecret: providerCfg.ClientSecret,
		RedirectURL:  fmt.Sprintf("%s/auth/oidc/callback/%s", config.Config.OIDC.RedirectURL, providerName),
		Scopes:       scopes,
		Endpoint:     provider.Endpoint(),
	}

	return &OIDCManager{
		provider:     provider,
		oauth2Cfg:    oauth2Cfg,
		verifier:     provider.Verifier(&oidc.Config{ClientID: providerCfg.ClientID}),
		providerName: providerName,
	}, nil
}

// GetAuthorizationURL returns the URL to redirect user for authentication
func (om *OIDCManager) GetAuthorizationURL(state string) string {
	return om.oauth2Cfg.AuthCodeURL(state, oauth2.AccessTypeOffline)
}

// ExchangeCodeForToken exchanges authorization code for tokens
func (om *OIDCManager) ExchangeCodeForToken(ctx context.Context, code string) (*oauth2.Token, error) {
	return om.oauth2Cfg.Exchange(ctx, code)
}

// VerifyIDToken verifies the ID token and extracts claims
func (om *OIDCManager) VerifyIDToken(ctx context.Context, rawIDToken string) (*oidc.IDToken, error) {
	return om.verifier.Verify(ctx, rawIDToken)
}

// GetUserInfo extracts user information from ID token claims
func (om *OIDCManager) GetUserInfo(idToken *oidc.IDToken) (*OIDCUserInfo, error) {
	var userInfo OIDCUserInfo
	if err := idToken.Claims(&userInfo); err != nil {
		return nil, fmt.Errorf("failed to parse ID token claims: %w", err)
	}

	return &userInfo, nil
}

// GetUserInfoFromEndpoint fetches user info from the OIDC provider's userinfo endpoint
func (om *OIDCManager) GetUserInfoFromEndpoint(ctx context.Context, token *oauth2.Token) (*OIDCUserInfo, error) {
	userInfo, err := om.provider.UserInfo(ctx, oauth2.StaticTokenSource(token))
	if err != nil {
		return nil, fmt.Errorf("failed to get user info: %w", err)
	}

	var info OIDCUserInfo
	if err := userInfo.Claims(&info); err != nil {
		return nil, fmt.Errorf("failed to parse user info: %w", err)
	}

	return &info, nil
}

// HandleOIDCCallback processes the OIDC callback and returns or creates user
func HandleOIDCCallback(db interface{}, providerName string, code string, state string) (*models.Users, string, int64, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Create OIDC manager
	manager, err := NewOIDCManager(ctx, providerName)
	if err != nil {
		return nil, "", 0, fmt.Errorf("failed to create OIDC manager: %w", err)
	}

	// Exchange code for token
	token, err := manager.ExchangeCodeForToken(ctx, code)
	if err != nil {
		return nil, "", 0, fmt.Errorf("failed to exchange code for token: %w", err)
	}

	// Get ID token from token
	rawIDToken, ok := token.Extra("id_token").(string)
	if !ok {
		return nil, "", 0, fmt.Errorf("id_token not found in token response")
	}

	// Verify ID token
	idToken, err := manager.VerifyIDToken(ctx, rawIDToken)
	if err != nil {
		return nil, "", 0, fmt.Errorf("failed to verify ID token: %w", err)
	}

	// Get user info from ID token
	_, err = manager.GetUserInfo(idToken)
	if err != nil {
		return nil, "", 0, fmt.Errorf("failed to get user info: %w", err)
	}

	// Try to find existing user by OIDC provider and subject
	// For now, we'll use email-based lookup (you may want to extend Users model to store provider info)
	// This requires modification to the Users model

	// Return placeholder values - actual implementation will depend on your database setup
	return nil, "", 0, fmt.Errorf("database integration needed - see implementation notes")
}

// GenerateOIDCToken generates a JWT token for an OIDC authenticated user
func GenerateOIDCToken(userID uuid.UUID, rememberMe bool) (string, int64, error) {
	return GenerateJWT(userID, rememberMe)
}

// ValidateOIDCToken validates an OIDC-generated JWT token
func ValidateOIDCToken(signedToken string) error {
	return ValidateToken(signedToken)
}

// OIDCStateStore manages state tokens for CSRF protection
type OIDCStateStore interface {
	SaveState(state string, data map[string]interface{}) error
	GetState(state string) (map[string]interface{}, error)
	DeleteState(state string) error
}

// InMemoryStateStore is a simple in-memory implementation of OIDCStateStore
type InMemoryStateStore struct {
	states map[string]map[string]interface{}
}

// NewInMemoryStateStore creates a new in-memory state store
func NewInMemoryStateStore() *InMemoryStateStore {
	return &InMemoryStateStore{
		states: make(map[string]map[string]interface{}),
	}
}

// SaveState saves a state token
func (s *InMemoryStateStore) SaveState(state string, data map[string]interface{}) error {
	s.states[state] = data
	// Add expiration in production (e.g., using goroutine with timer)
	return nil
}

// GetState retrieves a state token
func (s *InMemoryStateStore) GetState(state string) (map[string]interface{}, error) {
	data, exists := s.states[state]
	if !exists {
		return nil, fmt.Errorf("state not found")
	}
	return data, nil
}

// DeleteState deletes a state token
func (s *InMemoryStateStore) DeleteState(state string) error {
	delete(s.states, state)
	return nil
}
