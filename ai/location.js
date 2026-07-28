// AI Location Services
const AILocation = {

    // ==========================================
    // 1. GEOLOCATION WRAPPER
    // ==========================================
    _watchId: null,
    _currentPosition: null,
    _positionHistory: [],
    _listeners: [],

    async getCurrentPosition(options = {}) {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation tidak didukung browser'));
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const data = {
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        accuracy: pos.coords.accuracy,
                        altitude: pos.coords.altitude,
                        speed: pos.coords.speed,
                        heading: pos.coords.heading,
                        timestamp: pos.timestamp,
                        source: 'gps'
                    };
                    this._currentPosition = data;
                    resolve(data);
                },
                (err) => reject(err),
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0, ...options }
            );
        });
    },

    startWatching(callback, options = {}) {
        if (!navigator.geolocation) return false;
        this._watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const data = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    accuracy: pos.coords.accuracy,
                    altitude: pos.coords.altitude,
                    speed: pos.coords.speed,
                    heading: pos.coords.heading,
                    timestamp: pos.timestamp,
                    source: 'gps'
                };
                this._currentPosition = data;
                this._positionHistory.push(data);
                if (this._positionHistory.length > 100) this._positionHistory.shift();
                callback(data);
                this._listeners.forEach(fn => fn(data));
            },
            (err) => console.error('Watch position error:', err),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000, ...options }
        );
        return true;
    },

    stopWatching() {
        if (this._watchId !== null) {
            navigator.geolocation.clearWatch(this._watchId);
            this._watchId = null;
        }
    },

    onPositionUpdate(fn) {
        this._listeners.push(fn);
        return () => { this._listeners = this._listeners.filter(f => f !== fn); };
    },

    getPositionHistory() {
        return [...this._positionHistory];
    },

    clearHistory() {
        this._positionHistory = [];
    },

    // ==========================================
    // 2. LOCATION VERIFICATION / TRUST SCORE
    // ==========================================
    async verifyLocation(position) {
        if (!position) position = this._currentPosition;
        if (!position) return null;

        const checks = {
            gpsSignal: this._checkGPSSignal(position),
            movementConsistency: this._checkMovementConsistency(position),
            networkConsistency: await this._checkNetworkConsistency(position),
            mockLocation: this._checkMockLocation(),
            speedCheck: this._checkSpeed(position),
            coordinateIntegrity: this._checkCoordinateIntegrity(position),
            historyConsistency: this._checkHistoryConsistency()
        };

        const weights = {
            gpsSignal: 0.25,
            movementConsistency: 0.2,
            networkConsistency: 0.15,
            mockLocation: 0.2,
            speedCheck: 0.1,
            coordinateIntegrity: 0.05,
            historyConsistency: 0.05
        };

        let totalScore = 0;
        for (const [key, check] of Object.entries(checks)) {
            totalScore += check.score * (weights[key] || 0);
        }

        const riskLevel = totalScore >= 80 ? 'low' : totalScore >= 50 ? 'medium' : 'high';
        const trustLevel = totalScore >= 90 ? 'verified' : totalScore >= 70 ? 'recommended' : 'high_risk';

        return {
            checks,
            totalScore: Math.round(totalScore),
            riskLevel,
            trustLevel,
            trustBadge: this._getTrustBadge(trustLevel),
            timestamp: Date.now()
        };
    },

    _checkGPSSignal(pos) {
        const accuracy = pos.accuracy || 100;
        let score = 100;
        if (accuracy > 100) score = 60;
        else if (accuracy > 50) score = 80;
        else if (accuracy > 20) score = 90;
        return { score, detail: `Akurasi GPS: ${Math.round(accuracy)}m`, status: score >= 80 ? 'good' : score >= 60 ? 'fair' : 'poor' };
    },

    _checkMovementConsistency(pos) {
        const history = this._positionHistory;
        if (history.length < 2) return { score: 85, detail: 'Data pergerakan terbatas', status: 'unknown' };

        const recent = history.slice(-10);
        let maxSpeed = 0;
        let inconsistentMoves = 0;

        for (let i = 1; i < recent.length; i++) {
            const dist = this._haversineDistance(recent[i-1], recent[i]);
            const timeDiff = (recent[i].timestamp - recent[i-1].timestamp) / 1000;
            if (timeDiff > 0) {
                const speed = dist / timeDiff;
                if (speed > maxSpeed) maxSpeed = speed;
                if (speed > 200) inconsistentMoves++;
            }
        }

        let score = 100;
        if (inconsistentMoves > 3) score = 30;
        else if (inconsistentMoves > 1) score = 60;
        else if (maxSpeed > 100) score = 70;

        return { score, detail: `Kecepatan maks: ${Math.round(maxSpeed * 3.6)} km/h`, status: score >= 80 ? 'consistent' : 'inconsistent' };
    },

    async _checkNetworkConsistency(pos) {
        try {
            const response = await fetch(`https://ipapi.co/json/`);
            if (response.ok) {
                const ipData = await response.json();
                const ipLat = ipData.latitude;
                const ipLng = ipData.longitude;
                const dist = this._haversineDistance({ lat: pos.lat, lng: pos.lng }, { lat: ipLat, lng: ipLng });
                const score = dist < 50 ? 95 : dist < 200 ? 75 : dist < 1000 ? 50 : 20;
                return { score, detail: `IP: ${ipData.city || 'Unknown'} (${Math.round(dist)}km dari GPS)`, status: score >= 70 ? 'consistent' : 'inconsistent' };
            }
        } catch (e) { /* fallback */ }
        return { score: 70, detail: 'Network check tidak tersedia', status: 'unknown' };
    },

    _checkMockLocation() {
        let score = 90;
        const indicators = [];

        if (window.chrome && window.chrome.runtime) {
            indicators.push('Chrome extension detected');
            score -= 10;
        }

        if (typeof navigator.__proto__ !== 'undefined') {
            indicators.push('Proto modification detected');
            score -= 15;
        }

        const hasCDP = !!document.querySelector('[data-debugger]');
        if (hasCDP) {
            indicators.push('Debug interface detected');
            score -= 10;
        }

        return { score: Math.max(0, score), detail: indicators.length ? indicators.join(', ') : 'Tidak ada indikasi mock location', status: score >= 80 ? 'clean' : 'suspicious' };
    },

    _checkSpeed(pos) {
        if (!pos.speed || pos.speed < 0) return { score: 80, detail: 'Speed data tidak tersedia', status: 'unknown' };
        const speedKmh = pos.speed * 3.6;
        let score = 100;
        if (speedKmh > 300) score = 10;
        else if (speedKmh > 200) score = 30;
        else if (speedKmh > 100) score = 60;
        return { score, detail: `Kecepatan: ${Math.round(speedKmh)} km/h`, status: score >= 60 ? 'normal' : 'suspicious' };
    },

    _checkCoordinateIntegrity(pos) {
        let score = 100;
        if (pos.lat < -90 || pos.lat > 90) score = 0;
        if (pos.lng < -180 || pos.lng > 180) score = 0;
        if (pos.lat === 0 && pos.lng === 0) score = 10;
        if (pos.lat === pos.lng && pos.lat !== 0) score = 20;
        return { score, detail: `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}`, status: score >= 80 ? 'valid' : 'suspicious' };
    },

    _checkHistoryConsistency() {
        const history = this._positionHistory;
        if (history.length < 3) return { score: 80, detail: 'Riwayat terbatas', status: 'unknown' };

        let teleportCount = 0;
        for (let i = 1; i < history.length; i++) {
            const dist = this._haversineDistance(history[i-1], history[i]);
            const timeDiff = (history[i].timestamp - history[i-1].timestamp) / 1000;
            if (timeDiff > 0 && dist / timeDiff > 200) teleportCount++;
        }

        let score = Math.max(0, 100 - teleportCount * 25);
        return { score, detail: `${teleportCount} perpindahan mencurigakan`, status: score >= 70 ? 'consistent' : 'inconsistent' };
    },

    _getTrustBadge(level) {
        const badges = {
            'verified': { icon: '🟢', text: 'Verified Location', class: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20' },
            'recommended': { icon: '🟡', text: 'Verification Recommended', class: 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' },
            'high_risk': { icon: '🔴', text: 'High Location Risk', class: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' }
        };
        return badges[level] || badges.recommended;
    },

    // ==========================================
    // 3. FRAUD DETECTION
    // ==========================================
    detectFraud(positionHistory) {
        const history = positionHistory || this._positionHistory;
        if (history.length < 2) return { isFraud: false, reason: 'Data tidak cukup', riskScore: 0 };

        const anomalies = [];

        // Check 1: Impossible speed between points
        for (let i = 1; i < history.length; i++) {
            const dist = this._haversineDistance(history[i-1], history[i]);
            const timeDiff = (history[i].timestamp - history[i-1].timestamp) / 1000;
            if (timeDiff > 0) {
                const speedKmh = (dist / timeDiff) * 3.6;
                if (speedKmh > 500) anomalies.push({ type: 'impossible_speed', detail: `${Math.round(speedKmh)} km/h antara 2 titik`, severity: 'high' });
                else if (speedKmh > 200) anomalies.push({ type: 'high_speed', detail: `${Math.round(speedKmh)} km/h`, severity: 'medium' });
            }
        }

        // Check 2: Same coordinates repeatedly
        const coordCounts = {};
        history.forEach(p => {
            const key = `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
            coordCounts[key] = (coordCounts[key] || 0) + 1;
        });
        for (const [coord, count] of Object.entries(coordCounts)) {
            if (count > 5) anomalies.push({ type: 'stationary_suspicious', detail: `${count} pembacaan di ${coord}`, severity: 'low' });
        }

        // Check 3: Rapid country changes
        const countries = [];
        for (const pos of history) {
            if (pos.country && (!countries.length || countries[countries.length-1] !== pos.country)) {
                countries.push(pos.country);
            }
        }
        if (countries.length > 3) anomalies.push({ type: 'country_hopping', detail: `${countries.length} negara berbeda`, severity: 'high' });

        // Check 4: GPS accuracy anomalies
        const lowAccuracy = history.filter(p => p.accuracy > 200).length;
        if (lowAccuracy > history.length * 0.5) anomalies.push({ type: 'low_accuracy', detail: `${lowAccuracy}/${history.length} pembacaan akurasi rendah`, severity: 'medium' });

        const riskScore = Math.min(100, anomalies.reduce((sum, a) => sum + (a.severity === 'high' ? 30 : a.severity === 'medium' ? 15 : 5), 0));

        return {
            isFraud: riskScore > 50,
            riskScore,
            anomalies,
            recommendation: riskScore > 70 ? 'disable_sharing' : riskScore > 40 ? 'warning' : 'safe'
        };
    },

    // ==========================================
    // 4. MEETING ASSISTANT
    // ==========================================
    async getMeetingInfo(userPos, targetPos) {
        if (!userPos || !targetPos) return null;

        const distance = this._haversineDistance(userPos, targetPos);
        const avgSpeed = 40; // km/h average city speed
        const etaMinutes = Math.round((distance / avgSpeed) * 60);

        let nearbyPlaces = [];
        try {
            const query = `lokasi aman di sekitar ${targetPos.lat},${targetPos.lng}`;
            const aiResult = await AIEngine.callGemini(
                `Untuk titik temu di koordinat ${targetPos.lat}, ${targetPos.lng}, sarankan 3 tempat aman dan mudah ditemukan (mall, kafe, kantor polisi, dll). Berikan JSON: [{"name":"nama","type":"jenis","distance":"estimasi jarak"}]`, 512
            );
            if (aiResult) {
                const parsed = AIEngine._jsonExtract(aiResult);
                if (parsed) nearbyPlaces = parsed;
            }
        } catch (e) { /* silent */ }

        return {
            distance: distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)} km`,
            eta: etaMinutes < 60 ? `${etaMinutes} menit` : `${Math.floor(etaMinutes/60)}j ${etaMinutes%60}m`,
            isSafeArea: true,
            nearbyPlaces,
            suggestion: distance < 0.5 ? 'Anda sudah sangat dekat!' : distance < 5 ? 'Perjalanan relatif dekat.' : 'Pertimbangkan untuk bertemu di tempat yang lebih dekat.'
        };
    },

    // ==========================================
    // 5. DISTANCE & NAVIGATION
    // ==========================================
    _haversineDistance(p1, p2) {
        const R = 6371;
        const dLat = this._toRad(p2.lat - p1.lat);
        const dLng = this._toRad(p2.lng - p1.lng);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(this._toRad(p1.lat)) * Math.cos(this._toRad(p2.lat)) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    },

    _toRad(deg) { return deg * (Math.PI / 180); },

    openNavigation(targetLat, targetLng, targetName) {
        const isAndroid = /android/i.test(navigator.userAgent);
        const isIOS = /iphone|ipad/i.test(navigator.userAgent);
        if (isAndroid) {
            window.open(`google.navigation:q=${targetLat},${targetLng}&mode=d`);
        } else if (isIOS) {
            window.open(`maps://maps.google.com/maps?daddr=${targetLat},${targetLng}&amp;ll=`);
        } else {
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${targetLat},${targetLng}`);
        }
    },

    // ==========================================
    // 6. DATABASE OPERATIONS
    // ==========================================
    async saveLocationShare(userId, data) {
        try {
            const { error } = await supabase.from('location_shares').insert({
                user_id: userId,
                lat: data.lat,
                lng: data.lng,
                accuracy: data.accuracy,
                shared_with: data.sharedWith || [],
                meeting_point: data.meetingPoint || null,
                is_live: data.isLive || false,
                trust_score: data.trustScore || null,
                status: 'active'
            });
            return !error;
        } catch (e) { console.error('Save location error:', e); return false; }
    },

    async updateLocationShare(shareId, data) {
        try {
            const { error } = await supabase.from('location_shares').update({
                lat: data.lat,
                lng: data.lng,
                accuracy: data.accuracy,
                updated_at: new Date().toISOString()
            }).eq('id', shareId);
            return !error;
        } catch (e) { console.error('Update location error:', e); return false; }
    },

    async stopLocationShare(shareId) {
        try {
            const { error } = await supabase.from('location_shares').update({ status: 'stopped' }).eq('id', shareId);
            return !error;
        } catch (e) { console.error('Stop location error:', e); return false; }
    },

    async getLocationShares(userId) {
        try {
            const { data, error } = await supabase.from('location_shares')
                .select('*')
                .eq('user_id', userId)
                .eq('status', 'active')
                .order('created_at', { ascending: false });
            return error ? [] : (data || []);
        } catch (e) { return []; }
    },

    async getSharedWithMe(userId) {
        try {
            const { data, error } = await supabase.from('location_shares')
                .select('*')
                .contains('shared_with', [userId])
                .eq('status', 'active')
                .order('created_at', { ascending: false });
            return error ? [] : (data || []);
        } catch (e) { return []; }
    },

    async saveSOS(userId, data) {
        try {
            const { error } = await supabase.from('emergency_shares').insert({
                user_id: userId,
                lat: data.lat,
                lng: data.lng,
                message: data.message || 'SOS',
                contacts: data.contacts || [],
                status: 'active'
            });
            return !error;
        } catch (e) { console.error('SOS error:', e); return false; }
    },

    async saveLocationAudit(action, userId, details) {
        try {
            await supabase.from('location_audit').insert({
                action,
                user_id: userId,
                details: JSON.stringify(details),
                created_at: new Date().toISOString()
            });
        } catch (e) { /* silent */ }
    }
};
