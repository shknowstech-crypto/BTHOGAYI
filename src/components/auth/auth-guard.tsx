@@ .. @@
   useEffect(() => {
     const checkAuth = async () => {
       try {
-        const { data: { session } } = await supabase.auth.getSession()
+        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
+        
+        if (sessionError) {
+          console.error('Session error:', sessionError)
+          logout()
+          if (requireAuth) {
+            router.push('/auth?error=session-error')
+          }
+          return
+        }
         
         if (session?.user) {
           // Validate BITS email
           if (!AuthService.validateBitsEmail(session.user.email!)) {
             await AuthService.signOut()
             logout()
             router.push('/auth?error=invalid-email')
             return
           }

           // Get or create user profile
           let profile = await AuthService.getUserProfile(session.user.id)
           
           if (!profile) {
-            profile = await AuthService.createUserProfile(session.user)
+            try {
+              profile = await AuthService.createUserProfile(session.user)
+            } catch (createError: any) {
+              console.error('Profile creation failed:', createError)
+              await AuthService.signOut()
+              logout()
+              router.push('/auth?error=profile-creation-failed')
+              return
+            }
           }

           setUser(profile)

           // Check if profile completion is required
           if (requireCompleteProfile && !AuthService.isProfileComplete(profile)) {
             router.push('/onboarding')
             return
           }
         } else {
           logout()
           if (requireAuth) {
             router.push(redirectTo || '/auth')
             return
           }
         }
       } catch (error) {
         console.error('Auth check failed:', error)
         logout()
         if (requireAuth) {
           router.push('/auth?error=auth-failed')
         }
       } finally {
         setIsChecking(false)
         setLoading(false)
       }
     }

     checkAuth()

     // Listen for auth changes
     const { data: { subscription } } = supabase.auth.onAuthStateChange(
       async (event, session) => {
         console.log('Auth state changed:', event, session?.user?.email)
         
         if (event === 'SIGNED_OUT') {
           logout()
           if (requireAuth) {
             router.push('/auth')
           }
         } else if (event === 'SIGNED_IN' && session?.user) {
+          // Validate BITS email on sign in
+          if (!AuthService.validateBitsEmail(session.user.email!)) {
+            await AuthService.signOut()
+            logout()
+            router.push('/auth?error=invalid-email')
+            return
+          }
+          
           const profile = await AuthService.getUserProfile(session.user.id)
           if (profile) {
             setUser(profile)
+            // Check if profile needs completion
+            if (requireCompleteProfile && !AuthService.isProfileComplete(profile)) {
+              router.push('/onboarding')
+            } else if (!requireCompleteProfile) {
+              router.push('/dashboard')
+            }
+          } else {
+            // Create new profile for first-time users
+            try {
+              const newProfile = await AuthService.createUserProfile(session.user)
+              setUser(newProfile)
+              router.push('/onboarding')
+            } catch (error) {
+              console.error('Failed to create profile:', error)
+              await AuthService.signOut()
+              logout()
+              router.push('/auth?error=profile-creation-failed')
+            }
           }
         }
       }
     )

     return () => subscription.unsubscribe()
   }, [requireAuth, requireCompleteProfile, redirectTo, router, setUser, setLoading, logout, supabase.auth])