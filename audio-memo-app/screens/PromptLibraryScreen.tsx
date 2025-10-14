import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { RootStackParamList, PromptTemplate } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { usePromptTemplates } from '../contexts/PromptTemplatesContext';

type Props = NativeStackScreenProps<RootStackParamList, 'PromptLibrary'>;

export default function PromptLibraryScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { systemTemplates, userTemplates, addTemplate, updateTemplate, deleteTemplate } = usePromptTemplates();
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [templatePrompt, setTemplatePrompt] = useState('');

  const handleAdd = () => {
    setEditingTemplate(null);
    setTemplateName('');
    setTemplatePrompt('');
    setShowModal(true);
  };

  const handleEdit = (template: PromptTemplate) => {
    setEditingTemplate(template);
    setTemplateName(template.name);
    setTemplatePrompt(template.prompt);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!templateName.trim() || !templatePrompt.trim()) {
      Alert.alert(
        t('screens:promptLibrary.errorTitle'),
        t('screens:promptLibrary.errorEmptyFields')
      );
      return;
    }

    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, templateName.trim(), templatePrompt.trim());
      } else {
        await addTemplate(templateName.trim(), templatePrompt.trim());
      }
      setShowModal(false);
      setTemplateName('');
      setTemplatePrompt('');
      setEditingTemplate(null);
    } catch (error: any) {
      Alert.alert(
        t('screens:promptLibrary.errorTitle'),
        error.message || t('screens:promptLibrary.errorSaving')
      );
    }
  };

  const handleDelete = (template: PromptTemplate) => {
    Alert.alert(
      t('screens:promptLibrary.deleteConfirm'),
      t('screens:promptLibrary.deleteMessage', { name: template.name }),
      [
        { text: t('common:buttons.cancel'), style: 'cancel' },
        {
          text: t('common:buttons.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTemplate(template.id);
            } catch (error: any) {
              Alert.alert(
                t('screens:promptLibrary.errorTitle'),
                error.message || t('screens:promptLibrary.errorDeleting')
              );
            }
          },
        },
      ]
    );
  };

  const renderTemplate = (template: PromptTemplate) => (
    <View
      key={template.id}
      style={[styles.templateCard, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.templateHeader}>
        <View style={styles.templateTitleRow}>
          <Ionicons
            name={template.isSystem ? 'star' : 'person'}
            size={16}
            color={template.isSystem ? colors.primary : colors.textSecondary}
            style={{ marginRight: 8 }}
          />
          <Text style={[styles.templateName, { color: colors.text }]}>
            {template.name}
          </Text>
          {template.isSystem && (
            <View style={[styles.systemBadge, { backgroundColor: colors.primary + '20' }]}>
              <Text style={[styles.systemBadgeText, { color: colors.primary }]}>
                {t('screens:promptLibrary.system')}
              </Text>
            </View>
          )}
        </View>
        {!template.isSystem && (
          <View style={styles.templateActions}>
            <TouchableOpacity
              onPress={() => handleEdit(template)}
              style={styles.actionButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="pencil" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(template)}
              style={styles.actionButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      <Text style={[styles.templatePrompt, { color: colors.textSecondary }]}>
        {template.prompt}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* System Templates */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="star-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('screens:promptLibrary.systemTemplates')}
            </Text>
          </View>
          {systemTemplates.map(renderTemplate)}
        </View>

        {/* User Templates */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t('screens:promptLibrary.userTemplates')}
            </Text>
          </View>
          {userTemplates.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="add-circle-outline" size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                {t('screens:promptLibrary.noUserTemplates')}
              </Text>
            </View>
          ) : (
            userTemplates.map(renderTemplate)
          )}
        </View>
      </ScrollView>

      {/* Add Button */}
      <TouchableOpacity
        onPress={handleAdd}
        style={[styles.fab, { backgroundColor: colors.primary }]}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowModal(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <Pressable
              style={[styles.modalContent, { backgroundColor: colors.card }]}
              onPress={(e) => e.stopPropagation()}
            >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingTemplate
                ? t('screens:promptLibrary.editTemplate')
                : t('screens:promptLibrary.addTemplate')}
            </Text>

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {t('screens:promptLibrary.nameLabel')}
              </Text>
              <TextInput
                value={templateName}
                onChangeText={setTemplateName}
                placeholder={t('screens:promptLibrary.namePlaceholder')}
                placeholderTextColor={colors.textSecondary}
                style={[styles.textInput, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                maxLength={50}
              />
            </View>

            {/* Prompt Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>
                {t('screens:promptLibrary.promptLabel')}
              </Text>
              <TextInput
                value={templatePrompt}
                onChangeText={setTemplatePrompt}
                placeholder={t('screens:promptLibrary.promptPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                style={[styles.textInputMultiline, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
            </View>

            {/* Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={styles.cancelButton}
              >
                <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
                  {t('common:buttons.cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.saveButtonText}>
                  {t('common:buttons.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  templateCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  templateTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
  },
  systemBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  systemBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  templateActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 4,
  },
  templatePrompt: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    marginTop: 12,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#ffaa3a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  keyboardAvoidingView: {
    width: '100%',
    maxWidth: 400,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  textInputMultiline: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    minHeight: 100,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  cancelButtonText: {
    fontWeight: '600',
  },
  saveButton: {
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
