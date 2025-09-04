import { Grid, Typography } from "@mui/material";
import { RHFTextField } from "src/components/hook-form";

export default function JobDetailsFields() {
  return (
    <Grid container spacing={2}>
      {/* Basic fields */}
      <Grid item xs={12} md={6}>
        <RHFTextField name="fields.title" label="Title Selector" />
      </Grid>
      <Grid item xs={12} md={6}>
        <RHFTextField name="fields.company" label="Company Selector" />
      </Grid>
      <Grid item xs={12} md={6}>
        <RHFTextField name="fields.location" label="Location Selector" />
      </Grid>
      <Grid item xs={12} md={6}>
        <RHFTextField name="fields.experience" label="Experience Selector" />
      </Grid>
      <Grid item xs={12} md={6}>
        <RHFTextField name="fields.salary" label="Salary Selector" />
      </Grid>
      <Grid item xs={12} md={6}>
        <RHFTextField name="fields.description" label="Description Selector" />
      </Grid>
      <Grid item xs={12} md={6}>
        <RHFTextField name="fields.posted" label="Posted Selector" />
      </Grid>
      <Grid item xs={12} md={6}>
        <RHFTextField name="fields.openings" label="Openings Selector" />
      </Grid>
      <Grid item xs={12} md={6}>
        <RHFTextField name="fields.applicants" label="Applicants Selector" />
      </Grid>

      {/* About Company (nested selector object) */}
      
    </Grid>
  );
}
