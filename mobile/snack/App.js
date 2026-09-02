import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://xnpfgsjgfmryurcpyclt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_SLz0RAn6oHfTxYs3KJWBRw_cI3oEqzH';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } });
const ROLES = ['All', 'Friend', 'Conversation', 'Gaming', 'Activity', 'Event', 'Travel', 'GF/BF role-play'];

export default function App() {
  const [screen, setScreen] = useState('home');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState('All');
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [selected, setSelected] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [bookings, setBookings] = useState([]);
  const [messages, setMessages] = useState([]);

  useEffect(() => { loadProviders(); }, []);

  async function loadProviders() {
    setLoading(true); setError('');
    const { data, error: e } = await supabase.from('shokon_providers').select('id,name,city,role,bio,hourly_rate,languages,verified').eq('active', true).order('created_at', { ascending: false });
    if (e) setError(e.message); else setProviders(data || []);
    setLoading(false);
  }

  const filtered = useMemo(() => providers.filter(p => {
    const hay = `${p.name} ${p.city} ${p.role} ${p.bio || ''}`.toLowerCase();
    return (role === 'All' || p.role === role) && (!city || (p.city || '').toLowerCase().includes(city.toLowerCase())) && (!search || hay.includes(search.toLowerCase()));
  }), [providers, role, city, search]);

  async function signIn() {
    setAuthMessage('');
    const { error: e } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setAuthMessage(e ? e.message : 'Signed in successfully.');
  }

  async function signUp() {
    setAuthMessage('');
    const { error: e } = await supabase.auth.signUp({ email: email.trim(), password });
    setAuthMessage(e ? e.message : 'Account created. Check your email if confirmation is enabled.');
  }

  async function book(provider) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setScreen('auth'); setAuthMessage('Sign in first to request a booking.'); return; }
    const starts = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const ends = new Date(starts.getTime() + 60 * 60 * 1000);
    const { data, error: e } = await supabase.from('shokon_bookings').insert({ provider_id: provider.id, customer_id: user.id, starts_at: starts.toISOString(), ends_at: ends.toISOString(), hours: 1, hourly_rate: provider.hourly_rate, total_amount: provider.hourly_rate, status: 'pending', payment_status: 'unpaid', notes: 'Requested from Expo Go preview' }).select().single();
    if (e) { setAuthMessage(e.message); return; }
    setBookings(b => [data, ...b]); setScreen('bookings');
  }

  async function loadBookings() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setScreen('auth'); return; }
    const { data, error: e } = await supabase.from('shokon_bookings').select('id,provider_id,starts_at,ends_at,hours,total_amount,status,payment_status').eq('customer_id', user.id).order('created_at', { ascending: false });
    if (e) setAuthMessage(e.message); else setBookings(data || []);
    setScreen('bookings');
  }

  async function loadMessages() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setScreen('auth'); return; }
    // RLS already limits this table to participants; fetch both sent and received messages.
    const { data, error: e } = await supabase.from('shokon_messages').select('id,booking_id,sender_id,body,created_at').order('created_at', { ascending: true }).limit(100);
    if (e) setAuthMessage(e.message); else setMessages(data || []);
    setScreen('messages');
  }

  if (screen === 'auth') return <Auth email={email} password={password} setEmail={setEmail} setPassword={setPassword} signIn={signIn} signUp={signUp} message={authMessage} back={() => setScreen('home')} />;
  if (screen === 'detail' && selected) return <Detail provider={selected} book={() => book(selected)} back={() => setScreen('home')} />;
  if (screen === 'bookings') return <Page title="My bookings" back={() => setScreen('home')}><FlatList data={bookings} keyExtractor={x => x.id} ListEmptyComponent={<Text style={s.empty}>No bookings yet.</Text>} renderItem={({ item }) => <View style={s.item}><Text style={s.bold}>Booking {item.id.slice(0, 8)}</Text><Text>{new Date(item.starts_at).toLocaleString()}</Text><Text>€{Number(item.total_amount).toFixed(0)} · {item.status} · cash {item.payment_status}</Text></View>} /></Page>;
  if (screen === 'messages') return <Page title="Messages" back={() => setScreen('home')}><Text style={s.muted}>Messages are tied to bookings.</Text>{messages.map(m => <View style={s.item} key={m.id}><Text style={s.bold}>{m.body}</Text><Text style={s.muted}>{new Date(m.created_at).toLocaleString()}</Text></View>)}</Page>;

  return <SafeAreaView style={s.screen}><View style={s.header}><View><Text style={s.logo}>SHOKON.</Text><Text style={s.tag}>Find someone to spend time with.</Text></View><Pressable style={s.outline} onPress={() => setScreen('auth')}><Text>Sign in</Text></Pressable></View><TextInput style={s.input} placeholder="Search people or roles" value={search} onChangeText={setSearch}/><TextInput style={s.input} placeholder="City" value={city} onChangeText={setCity}/><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chips}>{ROLES.map(r => <Pressable key={r} onPress={() => setRole(r)} style={[s.chip, role === r && s.active]}><Text style={role === r && s.white}>{r}</Text></Pressable>)}</ScrollView>{loading ? <ActivityIndicator style={{ marginTop: 30 }} /> : error ? <Text style={s.error}>{error}</Text> : <FlatList data={filtered} keyExtractor={x => x.id} contentContainerStyle={{ paddingBottom: 100 }} ListEmptyComponent={<Text style={s.empty}>No active providers yet.</Text>} renderItem={({ item }) => <Pressable style={s.card} onPress={() => { setSelected(item); setScreen('detail'); }}><View style={s.avatar}><Text style={{ fontSize: 28 }}>{item.role === 'Gaming' ? '🎮' : item.role === 'Travel' ? '✈️' : '😊'}</Text></View><View style={{ flex: 1 }}><View style={s.row}><Text style={s.name}>{item.name}{item.verified ? ' ✓' : ''}</Text><Text style={s.bold}>€{Number(item.hourly_rate).toFixed(0)}/h</Text></View><Text style={s.muted}>{item.role} · {item.city}</Text><Text style={{ marginVertical: 7 }} numberOfLines={2}>{item.bio || 'Friendly companionship and good company.'}</Text></View></Pressable>} />}<View style={s.bottom}><Pressable onPress={loadBookings}><Text>Bookings</Text></Pressable><Pressable onPress={loadMessages}><Text>Messages</Text></Pressable><Pressable onPress={() => setScreen('auth')}><Text>Account</Text></Pressable></View></SafeAreaView>;
}

function Page({ title, back, children }) { return <SafeAreaView style={s.screen}><View style={s.pageHead}><Pressable onPress={back}><Text>‹ Back</Text></Pressable><Text style={s.title}>{title}</Text><View style={{ width: 45 }} /></View>{children}</SafeAreaView>; }
function Auth({ email, password, setEmail, setPassword, signIn, signUp, message, back }) { return <Page title="Account" back={back}><TextInput style={s.input} placeholder="Email" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail}/><TextInput style={s.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword}/><Pressable style={s.button} onPress={signIn}><Text style={s.white}>Sign in</Text></Pressable><Pressable style={s.secondary} onPress={signUp}><Text>Create account</Text></Pressable>{message ? <Text style={s.error}>{message}</Text> : null}</Page>; }
function Detail({ provider, book, back }) { return <Page title={provider.name} back={back}><View style={s.detailAvatar}><Text style={{ fontSize: 42 }}>{provider.role === 'Gaming' ? '🎮' : provider.role === 'Travel' ? '✈️' : '😊'}</Text></View><Text style={s.title}>{provider.name}{provider.verified ? ' ✓' : ''}</Text><Text style={s.muted}>{provider.role} · {provider.city}</Text><Text style={{ marginVertical: 14 }}>{provider.bio || 'Friendly companionship and good company.'}</Text><Text style={s.price}>€{Number(provider.hourly_rate).toFixed(0)} / hour</Text><Pressable style={s.button} onPress={book}><Text style={s.white}>Request 1 hour · cash</Text></Pressable></Page>; }

const s = StyleSheet.create({ screen:{flex:1,padding:18,backgroundColor:'#f7f7f5'},header:{paddingTop:18,paddingBottom:12,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},logo:{fontSize:24,fontWeight:'900'},tag:{fontSize:15,color:'#555',marginTop:3},outline:{borderWidth:1,borderColor:'#222',borderRadius:12,paddingHorizontal:14,paddingVertical:10},input:{backgroundColor:'#fff',borderWidth:1,borderColor:'#ddd',borderRadius:12,padding:13,marginVertical:5,fontSize:15},chips:{gap:8,paddingVertical:6},chip:{backgroundColor:'#fff',borderWidth:1,borderColor:'#ddd',borderRadius:20,paddingHorizontal:13,paddingVertical:9},active:{backgroundColor:'#111',borderColor:'#111'},white:{color:'#fff'},card:{backgroundColor:'#fff',borderRadius:18,padding:15,marginTop:12,flexDirection:'row',gap:13,borderWidth:1,borderColor:'#e5e5e5'},avatar:{width:62,height:62,borderRadius:16,backgroundColor:'#eee',alignItems:'center',justifyContent:'center'},detailAvatar:{width:96,height:96,borderRadius:24,backgroundColor:'#eee',alignItems:'center',justifyContent:'center',marginBottom:15},row:{flexDirection:'row',justifyContent:'space-between',gap:8},name:{fontSize:18,fontWeight:'800',flexShrink:1},bold:{fontWeight:'800'},muted:{color:'#666',marginTop:4},price:{fontSize:22,fontWeight:'900',marginVertical:15},error:{color:'#b00020',marginTop:15},empty:{textAlign:'center',marginTop:40,color:'#666'},bottom:{position:'absolute',bottom:12,left:18,right:18,backgroundColor:'#fff',borderRadius:16,padding:14,flexDirection:'row',justifyContent:'space-around',borderWidth:1,borderColor:'#ddd'},pageHead:{paddingTop:15,paddingBottom:18,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},title:{fontSize:24,fontWeight:'900'},item:{backgroundColor:'#fff',padding:15,borderRadius:14,marginBottom:10},button:{backgroundColor:'#111',borderRadius:12,padding:14,alignItems:'center',marginTop:10},secondary:{backgroundColor:'#fff',borderWidth:1,borderColor:'#ccc',borderRadius:12,padding:14,alignItems:'center',marginTop:10}}
);