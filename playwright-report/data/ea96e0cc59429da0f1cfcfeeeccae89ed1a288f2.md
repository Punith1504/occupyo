# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cross-role-lifecycle.spec.ts >> Cross-Role Lifecycle: Owner & Tenant Interaction >> Owner creates a listing and Tenant books it simultaneously
- Location: tests\e2e\cross-role-lifecycle.spec.ts:4:7

# Error details

```
Test timeout of 30000ms exceeded.
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e7]:
        - heading "Sign in to occupyo" [level=1] [ref=e8]
        - paragraph [ref=e9]: Welcome back! Please sign in to continue
      - generic [ref=e10]:
        - generic [ref=e12]:
          - button "Sign in with GitHub" [ref=e13] [cursor=pointer]:
            - generic "Sign in with GitHub" [ref=e15]
          - button "Sign in with Google" [ref=e16] [cursor=pointer]:
            - generic "Sign in with Google" [ref=e18]
          - button "Sign in with Vercel" [ref=e19] [cursor=pointer]:
            - generic "Sign in with Vercel" [ref=e21]
        - paragraph [ref=e24]: or
        - generic [ref=e26]:
          - generic [ref=e27]:
            - generic [ref=e30]:
              - generic [ref=e31]: Email address or username
              - textbox "Email address or username" [ref=e33]:
                - /placeholder: Enter email or username
            - generic:
              - generic: Password
              - generic:
                - textbox:
                  - /placeholder: Enter your password
                - button
          - button [ref=e36] [cursor=pointer]
    - generic [ref=e40]:
      - generic [ref=e41]:
        - generic [ref=e42]: Don’t have an account?
        - link "Sign up" [ref=e43] [cursor=pointer]:
          - /url: http://localhost:3000/sign-up#/?redirect_url=http%3A%2F%2Flocalhost%3A3000%2Fdashboard%2Fowner%2Flistings%2Fcreate
      - generic [ref=e45]:
        - generic [ref=e47]:
          - paragraph [ref=e48]: Secured by
          - link "Clerk logo" [ref=e49] [cursor=pointer]:
            - /url: https://go.clerk.com/components
        - paragraph [ref=e55]: Development mode
  - button [ref=e57]
  - button "Open Next.js Dev Tools" [ref=e66] [cursor=pointer]:
    - generic [ref=e69]:
      - text: Rendering
      - generic [ref=e70]:
        - generic [ref=e71]: .
        - generic [ref=e72]: .
        - generic [ref=e73]: .
  - alert [ref=e74]
```