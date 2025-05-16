import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import getColors from '../../constants/Colors';
import { useTheme } from '../../contexts/ThemeContext';

interface Section {
  id: string;
  title: string;
}

interface Category {
  id: string;
  title: string;
  sections: Section[];
}

interface SectionSelectorProps {
  categories: Category[];
  selectedSection: string | null;
  onSectionSelect: (sectionId: string) => void;
}

export default function SectionSelector({
  categories,
  selectedSection,
  onSectionSelect,
}: SectionSelectorProps) {
  const { theme } = useTheme();
  const colors = getColors(theme);
  const selectedBg = theme === 'dark' ? 'rgba(76, 175, 80, 0.15)' : '#f0fdf4';

  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.white }]}>
      {categories.map((category, catIdx) => (
        <View key={category.id}>
          <Text style={[styles.sectionCategory, { color: colors.primary }]}>
            {category.title}
          </Text>
          {category.sections.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={[
                styles.sectionRadioRow,
                { backgroundColor: colors.white },
                selectedSection === section.id && {
                  backgroundColor: selectedBg,
                },
              ]}
              onPress={() => onSectionSelect(section.id)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.radioOuter,
                  { borderColor: colors.primary },
                  selectedSection === section.id && {
                    borderColor: colors.primary,
                  },
                ]}
              >
                {selectedSection === section.id && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: colors.primary },
                    ]}
                  />
                )}
              </View>
              <Text
                style={[styles.sectionRadioText, { color: colors.textDark }]}
              >
                {section.title}
              </Text>
            </TouchableOpacity>
          ))}
          {catIdx !== categories.length - 1 && (
            <View style={styles.sectionDivider} />
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 16,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  sectionCategory: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 4,
    marginLeft: 4,
  },
  sectionRadioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  sectionRadioText: {
    fontSize: 15,
    marginLeft: 12,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.06)',
    marginVertical: 8,
    borderRadius: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
