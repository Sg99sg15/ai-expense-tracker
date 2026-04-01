import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Expense } from '../types';
import { addExpense, getExpenses, deleteExpense } from '../services/api';

// Category emoji map
const CATEGORY_EMOJI: Record<string, string> = {
  'Food & Dining': '🍔',
  'Transport': '🚗',
  'Shopping': '🛒',
  'Entertainment': '📺',
  'Bills & Utilities': '📄',
  'Health': '💊',
  'Travel': '✈️',
  'Other': '📦',
};

function getTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays} days ago`;
}

export default function ExpenseTrackerScreen() {
  const [input, setInput] = useState('');
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [successExpense, setSuccessExpense] = useState<Expense | null>(null);

  const loadExpenses = useCallback(async () => {
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch {
      Alert.alert('Error', 'Could not load expenses. Is the server running?');
    }
  }, []);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };

  const handleAddExpense = async () => {
    if (!input.trim() || loading) return;

    setLoading(true);
    try {
      const expense = await addExpense(input.trim());
      setExpenses(prev => [expense, ...prev]);
      setSuccessExpense(expense);
      setInput('');
      setTimeout(() => setSuccessExpense(null), 3000);
    } catch (error: any) {
      Alert.alert('Could not add expense', error.message || 'Please try again');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(
      'Delete Expense',
      'Delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(id);
            try {
              await deleteExpense(id);
              setExpenses(prev => prev.filter(e => e.id !== id));
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Could not delete expense');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const renderExpense = ({ item }: { item: Expense }) => {
    const emoji = CATEGORY_EMOJI[item.category] || '📦';
    const isDeleting = deletingId === item.id;

    return (
      <View style={styles.expenseCard}>
        <View style={styles.expenseLeft}>
          <View style={styles.categoryRow}>
            <Text style={styles.categoryEmoji}>{emoji}</Text>
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <Text style={styles.descriptionText}>{item.description}</Text>
          {item.merchant && (
            <Text style={styles.merchantText}>{item.merchant}</Text>
          )}
          <Text style={styles.timeText}>{getTimeAgo(item.created_at)}</Text>
        </View>
        <View style={styles.expenseRight}>
          <Text style={styles.amountText}>
            {item.currency === 'INR' ? '₹' : item.currency}{item.amount.toLocaleString('en-IN')}
          </Text>
          <TouchableOpacity
            onPress={() => handleDelete(item.id)}
            style={styles.deleteBtn}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#ff4444" />
            ) : (
              <Text style={styles.deleteIcon}>🗑️</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI Expense Tracker</Text>
          <Text style={styles.headerSubtitle}>Add expenses in plain English</Text>
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <TextInput
            style={styles.textInput}
            placeholder='e.g., Spent 500 on groceries at BigBazaar'
            placeholderTextColor="#aaa"
            value={input}
            onChangeText={setInput}
            multiline
            returnKeyType="done"
            onSubmitEditing={handleAddExpense}
          />
          <TouchableOpacity
            style={[styles.addButton, (!input.trim() || loading) && styles.addButtonDisabled]}
            onPress={handleAddExpense}
            disabled={!input.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.addButtonText}>Add</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Success Card */}
        {successExpense && (
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>✅ Added Successfully!</Text>
            <Text style={styles.successDetail}>Amount: ₹{successExpense.amount}</Text>
            <Text style={styles.successDetail}>
              Category: {CATEGORY_EMOJI[successExpense.category]} {successExpense.category}
            </Text>
            <Text style={styles.successDetail}>Description: {successExpense.description}</Text>
            {successExpense.merchant && (
              <Text style={styles.successDetail}>Merchant: {successExpense.merchant}</Text>
            )}
          </View>
        )}

        {/* Expenses List */}
        <Text style={styles.sectionTitle}>Recent Expenses</Text>
        <FlatList
          data={expenses}
          keyExtractor={item => item.id.toString()}
          renderItem={renderExpense}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C63FF" />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💸</Text>
              <Text style={styles.emptyText}>No expenses yet. Add your first one!</Text>
            </View>
          }
          contentContainerStyle={expenses.length === 0 ? { flex: 1 } : { paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    marginTop: 2,
  },
  inputSection: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    maxHeight: 80,
    paddingRight: 8,
  },
  addButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#c0bbff',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  successCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#e8f5e9',
    borderRadius: 14,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  successTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2e7d32',
    marginBottom: 6,
  },
  successDetail: {
    fontSize: 13,
    color: '#388e3c',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a2e',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  expenseCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  expenseLeft: {
    flex: 1,
    marginRight: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C63FF',
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 2,
  },
  merchantText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 11,
    color: '#bbb',
    marginTop: 2,
  },
  expenseRight: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteIcon: {
    fontSize: 18,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#555',
  },
});
