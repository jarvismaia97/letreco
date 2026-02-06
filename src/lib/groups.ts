import { supabase, isSupabaseConfigured } from './supabase';

export interface FriendGroup {
  id: string;
  name: string;
  owner_id: string;
  invite_code: string;
  created_at: string;
  member_count?: number;
  is_owner?: boolean;
}

export interface GroupMember {
  player_id: string;
  display_name: string;
  avatar_url: string | null;
  attempts: number | null;
  won: boolean | null;
  played: boolean;
  played_at: string | null;
}

// Get player's groups
export async function getMyGroups(playerId: string): Promise<FriendGroup[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  // Get groups where user is owner
  const { data: ownedGroups } = await supabase
    .from('friend_groups')
    .select('*, group_members(count)')
    .eq('owner_id', playerId);

  // Get groups where user is member
  const { data: memberGroups } = await supabase
    .from('group_members')
    .select('group_id, friend_groups(*)')
    .eq('player_id', playerId);

  const groups: FriendGroup[] = [];
  const seenIds = new Set<string>();

  // Add owned groups
  if (ownedGroups) {
    for (const g of ownedGroups) {
      if (!seenIds.has(g.id)) {
        seenIds.add(g.id);
        groups.push({
          ...g,
          is_owner: true,
          member_count: g.group_members?.[0]?.count || 0,
        });
      }
    }
  }

  // Add member groups
  if (memberGroups) {
    for (const gm of memberGroups) {
      const g = gm.friend_groups as unknown as FriendGroup;
      if (g && !seenIds.has(g.id)) {
        seenIds.add(g.id);
        groups.push({
          ...g,
          is_owner: g.owner_id === playerId,
        });
      }
    }
  }

  return groups;
}

// Create a new group
export async function createGroup(name: string, ownerId: string): Promise<FriendGroup | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from('friend_groups')
    .insert({ name, owner_id: ownerId })
    .select()
    .single();

  if (error || !data) {
    console.error('Failed to create group:', error);
    return null;
  }

  // Add owner as member
  await supabase
    .from('group_members')
    .insert({ group_id: data.id, player_id: ownerId });

  return { ...data, is_owner: true, member_count: 1 };
}

// Join a group by invite code
export async function joinGroupByCode(inviteCode: string, playerId: string): Promise<{ success: boolean; error?: string; group?: FriendGroup }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase não configurado' };
  }

  // Find group by invite code
  const { data: group, error: findError } = await supabase
    .from('friend_groups')
    .select('*')
    .eq('invite_code', inviteCode.toLowerCase().trim())
    .single();

  if (findError || !group) {
    return { success: false, error: 'Código de convite inválido' };
  }

  // Check if already a member
  const { data: existing } = await supabase
    .from('group_members')
    .select('id')
    .eq('group_id', group.id)
    .eq('player_id', playerId)
    .single();

  if (existing) {
    return { success: false, error: 'Já és membro deste grupo' };
  }

  // Join the group
  const { error: joinError } = await supabase
    .from('group_members')
    .insert({ group_id: group.id, player_id: playerId });

  if (joinError) {
    console.error('Failed to join group:', joinError);
    return { success: false, error: 'Erro ao entrar no grupo' };
  }

  return { success: true, group: { ...group, is_owner: group.owner_id === playerId } };
}

// Leave a group
export async function leaveGroup(groupId: string, playerId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('group_id', groupId)
    .eq('player_id', playerId);

  return !error;
}

// Delete a group (owner only)
export async function deleteGroup(groupId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  const { error } = await supabase
    .from('friend_groups')
    .delete()
    .eq('id', groupId);

  return !error;
}

// Get group members with today's results
export async function getGroupDailyRanking(groupId: string, letterMode: number): Promise<GroupMember[]> {
  if (!isSupabaseConfigured() || !supabase) return [];

  const { data, error } = await supabase
    .rpc('get_group_daily_ranking', { 
      p_group_id: groupId, 
      p_letter_mode: letterMode 
    });

  if (error) {
    console.error('Failed to get group ranking:', error);
    return [];
  }

  return data || [];
}

// Get group details
export async function getGroupDetails(groupId: string): Promise<FriendGroup | null> {
  if (!isSupabaseConfigured() || !supabase) return null;

  const { data, error } = await supabase
    .from('friend_groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (error || !data) return null;
  return data;
}
