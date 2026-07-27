// Firebase Authentication (Google Login Only)
const FirebaseAuth = {
    currentUser: null,
    userProfile: null,
    _authReady: false,
    _loadingProfile: false,

    init() {
        auth.onAuthStateChanged(async (user) => {
            this.currentUser = user;
            if (user) {
                this._authReady = false;
                await this.loadOrCreateProfile(user);
                this._authReady = true;
                App.onAuthReady(true);
            } else {
                this.userProfile = null;
                this._authReady = true;
                App.onAuthReady(false);
            }
        });
    },

    async loadOrCreateProfile(user) {
        // Prevent concurrent runs (e.g., from onAuthStateChanged + loginGoogle)
        if (this._loadingProfile) {
            // Wait for the in-flight profile load to finish
            while (this._loadingProfile) {
                await new Promise(r => setTimeout(r, 50));
            }
            return;
        }
        this._loadingProfile = true;

        // Always set a basic profile from Firebase user data first
        this.userProfile = {
            id: user.uid,
            displayName: user.displayName || 'User',
            email: user.email,
            photo_url: user.photoURL,
            role: ROLES.MEMBER
        };

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.uid)
                .single();

            if (error && error.code === 'PGRST116') {
                const newProfile = {
                    id: user.uid,
                    display_name: user.displayName || 'User',
                    email: user.email,
                    photo_url: user.photoURL,
                    role: ROLES.MEMBER,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                const { data: inserted, error: insertError } = await supabase.from('users').insert(newProfile).select().single();
                if (insertError) {
                    console.error('Insert profile error:', insertError);
                } else {
                    this.userProfile = inserted;
                }
            } else if (error) {
                console.error('Load profile error:', error);
            } else {
                this.userProfile = data;
            }
        } catch (err) {
            console.error('Profile error:', err);
        } finally {
            this._loadingProfile = false;
        }
    },

    async loginWithGoogle() {
        const provider = new firebase.auth.GoogleAuthProvider();
        try {
            const result = await auth.signInWithPopup(provider);
            Toast.show('Berhasil login!', 'success');
            return result.user;
        } catch (err) {
            console.error('Google login error:', err);
            if (err.code !== 'auth/popup-closed-by-user') {
                Toast.show('Gagal login dengan Google', 'error');
            }
            return null;
        }
    },

    async logout() {
        await auth.signOut();
        this.currentUser = null;
        this.userProfile = null;
        Toast.show('Berhasil logout', 'info');
        Router.navigate('home');
    },

    isLoggedIn() { return !!this.currentUser; },
    isAdmin() { return this.userProfile?.role === ROLES.ADMIN; },
    isModerator() { return this.userProfile?.role === ROLES.MODERATOR || this.isAdmin(); },
    getRole() { return this.userProfile?.role || ROLES.GUEST; }
};
