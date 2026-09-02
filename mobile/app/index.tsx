import { useEffect, useMemo, useState } from 'react';
import { Link, router } from 'expo-router';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { requireSupabase } from '../lib/supabase';

type Provider = {
  id: string;
  name: string;
  city: string;
  role: string;
  bio: string | null;
  hourly_rate: number;
  languages: string[] | null;
  verified: boolean;
};

const roles = ['All', 'Friend', 'Conversation', 'Gaming', 'Activity', 'Event', 'Travel', 'GF/BF role-play'];

export default function Home() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [role, setRole] = useState('All');
  const [city, setCity] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    try {
      const supabase = requireSupabase();
      const { data, error: queryError } = await supabase
        .from('shokon_providers')
        .select('id,name,city,role,bio,hourly_rate,languages,verified')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (queryError) throw queryError;
      setProviders((data ?? []) as Provider[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not load providers.');
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const search = q.trim().toLowerCase();
    const citySearch = city.trim().toLowerCase();

    return providers.filter((provider) => {
      const matchesRole = role === 'All' || provider.role === role;
      const matchesCity = !citySearch || provider.city.toLowerCase().includes(citySearch);
      const haystack = `${provider.name} ${provider.city} ${provider.role} ${provider.bio ?? ''}`.toLowerCase();
      return matchesRole && matchesCity && (!search || haystack.includes(search));
    });
  }, [providers, role, city, q]);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>SHOKON.</Text>
          <Text style={styles.tag}>Find someone to spend time with.</Text>
        </View>
        <Link href="/auth" asChild>
          <Pressable style={styles.outline}>
            <Text>Sign in</Text>
          </Pressable>
        </Link>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Search people or roles"
        value={q}
        onChangeText={setQ}
      />
      <TextInput
        style={styles.input}
        placeholder="City (e.g. Pristina)"
        value={city}
        onChangeText={setCity}
      />

      <FlatList
        horizontal
        data={roles}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.chips}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setRole(item)}
            style={[styles.chip, role === item && styles.chipActive]}
          >
            <Text style={role === item ? styles.chipTextActive : undefined}>{item}</Text>
          </Pressable>
        )}
      />

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No active providers yet.</Text>}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => router.push({ pathname: '/provider/[id]', params: { id: item.id } })}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.role === 'Gaming' ? '🎮' : item.role === 'Travel' ? '✈️' : '😊'}
                </Text>
              </View>
              <View style={styles.providerBody}>
                <View style={styles.row}>
                  <Text style={styles.name}>{item.name}{item.verified ? ' ✓' : ''}</Text>
                  <Text style={styles.price}>€{Number(item.hourly_rate).toFixed(0)}/h</Text>
                </View>
                <Text style={styles.muted}>{item.role} · {item.city}</Text>
                <Text style={styles.bio} numberOfLines={2}>
                  {item.bio || 'Friendly companionship and good company.'}
                </Text>
                <Text style={styles.muted}>{item.languages?.join(' · ') || 'Albanian · English'}</Text>
              </View>
            </Pressable>
          )}
        />
      )}

      <View style={styles.bottom}>
        <Link href="/bookings" asChild>
          <Pressable><Text>Bookings</Text></Pressable>
        </Link>
        <Link href="/messages" asChild>
          <Pressable><Text>Messages</Text></Pressable>
        </Link>
        <Link href="/provider" asChild>
          <Pressable><Text>Become a Shokon</Text></Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 18, backgroundColor: '#f7f7f5' },
  header: { paddingTop: 35, paddingBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: 24, fontWeight: '900' },
  tag: { fontSize: 16, marginTop: 3, color: '#555' },
  outline: { borderWidth: 1, borderColor: '#222', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, padding: 13, marginVertical: 5, fontSize: 15 },
  chips: { gap: 8, paddingVertical: 4 },
  chip: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 20, paddingHorizontal: 13, paddingVertical: 9 },
  chipActive: { backgroundColor: '#111', borderColor: '#111' },
  chipTextActive: { color: '#fff' },
  loader: { marginTop: 30 },
  list: { paddingBottom: 110 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 15, marginTop: 12, flexDirection: 'row', gap: 13, borderWidth: 1, borderColor: '#e5e5e5' },
  avatar: { width: 62, height: 62, borderRadius: 16, backgroundColor: '#eee', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28 },
  providerBody: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  name: { fontSize: 18, fontWeight: '800' },
  price: { fontWeight: '800' },
  muted: { color: '#666', marginTop: 3 },
  bio: { marginVertical: 8, lineHeight: 20 },
  error: { color: '#b00020', marginTop: 20 },
  empty: { textAlign: 'center', marginTop: 40, color: '#666' },
  bottom: { position: 'absolute', bottom: 12, left: 18, right: 18, backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', justifyContent: 'space-around', borderWidth: 1, borderColor: '#ddd' },
});
