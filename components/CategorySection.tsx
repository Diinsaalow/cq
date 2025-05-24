import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import SectionCard from './SectionCard';
import SeeMoreButton from './SeeMoreButton';
import getColors from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { CategoryData } from '../types';
import { Plus } from 'lucide-react-native';

interface CategorySectionProps {
  data: CategoryData;
  onSectionPress: (id: string) => void;
  onSeeMorePress: (categoryId: string) => void;
  home?: boolean;
  isAdmin?: boolean;
}

export default function CategorySection({
  data,
  onSectionPress,
  onSeeMorePress,
  home = false,
  isAdmin = false,
}: CategorySectionProps) {
  const { theme } = useTheme();
  const colors = getColors(theme);
  const hasSections = data.sections.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: colors.textDark }]}>
          {data.title}
        </Text>
        <View
          style={[styles.decorativeLine, { backgroundColor: colors.primary }]}
        />
      </View>

      {hasSections ? (
        <>
          <View style={styles.sectionsContainer}>
            {home
              ? data.sections
                  .slice(0, 3)
                  .map((item, index) => (
                    <SectionCard
                      key={item.id}
                      item={item}
                      onPress={onSectionPress}
                      index={index}
                    />
                  ))
              : data.sections.map((item, index) => (
                  <SectionCard
                    key={item.id}
                    item={item}
                    onPress={onSectionPress}
                    index={index}
                  />
                ))}
          </View>
          {data.sections.length > 3 && (
            <SeeMoreButton onPress={() => onSeeMorePress(data.id)} />
          )}
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textLight }]}>
            {isAdmin
              ? 'No sections available yet'
              : 'No sections available in this category'}
          </Text>
          {isAdmin && (
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.primary }]}
              onPress={() => onSeeMorePress(data.id)}
            >
              <Plus size={20} color={colors.white} style={styles.addIcon} />
              <Text style={[styles.addButtonText, { color: colors.white }]}>
                Add Section
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 32,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginRight: 12,
  },
  decorativeLine: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    opacity: 0.15,
  },
  sectionsContainer: {
    gap: 16,
    marginBottom: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addIcon: {
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
