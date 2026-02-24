import { useState, useEffect } from 'react';
import { Grid, Typography, MenuItem } from '@mui/material';
import { useFormContext } from 'react-hook-form';
import { RHFSelect, RHFTextField } from 'src/components/hook-form';
import axiosInstance from 'src/utils/axios';

export default function DataSourceStep() {
  const { control, watch, setValue } = useFormContext();
  const [databases, setDatabases] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);

  const selectedModel = watch('sourceModel');

  useEffect(() => {
    loadDatabases();
  }, []);

  useEffect(() => {
    if (selectedModel) {
      loadFields(selectedModel);
    }
  }, [selectedModel]);

  const loadDatabases = async () => {
    try {
      const response = await axiosInstance.get('/deliver');
      if (Array.isArray(response?.data)) {
        setDatabases(response.data);
      }
    } catch (error) {
      console.error('Error loading databases:', error);
    }
  };

  const loadFields = async (modelId) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/deliver/${modelId}/fields/false`);
      if (response.data?.fields) {
        setFields(response.data.fields);
        setValue('sourceRepository', response.data.repositoryName);
      }
    } catch (error) {
      console.error('Error loading fields:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h6" gutterBottom>
          Select Data Source
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Choose the database/model and URL field to check
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <RHFSelect name="sourceModel" label="Database / Model" required fullWidth>
          <MenuItem value="">Select Database</MenuItem>
          {databases.map((db) => (
            <MenuItem key={db.id} value={db.id}>
              {db.modelName}
            </MenuItem>
          ))}
        </RHFSelect>
      </Grid>

      <Grid item xs={12}>
        <RHFTextField
          name="sourceRepository"
          label="Repository Name"
          fullWidth
          InputProps={{ readOnly: true }}
          helperText="Auto-filled based on selected model"
        />
      </Grid>

      <Grid item xs={12}>
        <RHFSelect name="urlField" label="URL Field" required fullWidth disabled={!selectedModel || loading}>
          <MenuItem value="">Select URL Field</MenuItem>
          {fields.map((field) => (
            <MenuItem key={field.name} value={field.name}>
              {field.name}
            </MenuItem>
          ))}
        </RHFSelect>
      </Grid>
    </Grid>
  );
}
