import { useEffect, useState } from "react";
import {
  Checkbox,
  Grid,
  MenuItem,
  Stack,
  FormControlLabel,
} from "@mui/material";
import { RHFSelect, RHFTextField } from "src/components/hook-form";
import axiosInstance from "src/utils/axios";

export default function TransformationComponents() {
  const [databases, setDatabases] = useState([]);
  const [stagingId, setStagingId] = useState("");
  const [productionId, setProductionId] = useState("");
  const [productionFields, setProductionFields] = useState([]);
  const [stagingFields, setStagingFields] = useState([]);
  const [customSelected, setCustomSelected] = useState({});
  const [nullableSelected, setNullableSelected] = useState({});

  // Fetch all Deliver models
  useEffect(() => {
    axiosInstance
      .get("/deliver")
      .then((res) => {
        if (Array.isArray(res?.data)) setDatabases(res.data);
      })
      .catch((err) => console.error("Error fetching Deliver models:", err));
  }, []);

  // Fetch fields for selected Staging model
  useEffect(() => {
    if (!stagingId) {
      setStagingFields([]);
      return;
    }
    axiosInstance
      .get(`/deliver/${stagingId}/fields/true`)
      .then((res) => {
        if (res.data?.fields) setStagingFields(res.data.fields);
      })
      .catch((err) => {
        console.error("Error fetching source fields:", err);
        setStagingFields([]);
      });
  }, [stagingId]);

  // Fetch fields for selected Production model
  useEffect(() => {
    if (!productionId) {
      setProductionFields([]);
      return;
    }
    axiosInstance
      .get(`/deliver/${productionId}/fields/false`)
      .then((res) => {
        if (res.data?.fields) setProductionFields(res.data.fields);
      })
      .catch((err) => {
        console.error("Error fetching target fields:", err);
        setProductionFields([]);
      });
  }, [productionId]);

  return (
    <Grid container spacing={3}>
      {/* Select Staging Model */}
      <Grid item xs={12}>
        <RHFSelect
          fullWidth
          label="Select Staging Model"
          name="stagingModel"
          value={stagingId}
          onChange={(e) => setStagingId(e.target.value)}
        >
          {databases.map((db) => (
            <MenuItem key={db.id} value={db.id}>
              {db.modelName}
            </MenuItem>
          ))}
        </RHFSelect>
      </Grid>

      {/* Select Production Model */}
      {stagingId && (
        <Grid item xs={12}>
          <RHFSelect
            fullWidth
            label="Select Production Model"
            name="productionModel"
            value={productionId}
            onChange={(e) => setProductionId(e.target.value)}
          >
            {databases.map((db) => (
              <MenuItem key={db.id} value={db.id}>
                {db.modelName}
              </MenuItem>
            ))}
          </RHFSelect>
        </Grid>
      )}

      {/* Production fields mapping */}
      {productionId && productionFields.length > 0 && (
        <Grid item xs={12}>
          {productionFields.map((field) => {
            const isCustom = customSelected[field.name] === true;
            const isNullable = nullableSelected[field.name] === true;

            return (
              <Stack
                direction="row"
                spacing={2}
                key={field.name}
                sx={{ width: "100%", mt: 3 }}
              >
                {/* Production Field Name */}
                <RHFTextField
                  fullWidth
                  value={field.name}
                  name={`target.${field.name}.fieldName`}
                  label="Production Field"
                  InputProps={{ readOnly: true }}
                />

                {/* Production Field Type */}
                <RHFTextField
                  fullWidth
                  value={field.type}
                  name={`target.${field.name}.fieldType`}
                  label="Field Type"
                  InputProps={{ readOnly: true }}
                />

                {/* Mapping Staging Dropdown */}
                <RHFSelect
                  fullWidth
                  label="Map from Staging"
                  name={`mapping.${field.name}`}
                  onChange={(e) => {
                    if (e.target.value === "custom") {
                      setCustomSelected((prev) => ({
                        ...prev,
                        [field.name]: true,
                      }));
                    } else {
                      setCustomSelected((prev) => ({
                        ...prev,
                        [field.name]: false,
                      }));
                    }
                  }}
                >
                  {stagingFields.map((srcField) => (
                    <MenuItem key={srcField.name} value={srcField.name}>
                      {srcField.name}
                    </MenuItem>
                  ))}
                  <MenuItem value="custom">Custom</MenuItem>
                </RHFSelect>

                {/* Custom Value Input */}
                {isCustom && (
                  <RHFTextField
                    fullWidth
                    name={`custom.${field.name}`}
                    label="Custom Value"
                  />
                )}

                {/* Nullable Checkbox */}
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isNullable}
                      onChange={(e) =>
                        setNullableSelected((prev) => ({
                          ...prev,
                          [field.name]: e.target.checked,
                        }))
                      }
                    />
                  }
                  label="Nullable"
                />
              </Stack>
            );
          })}
        </Grid>
      )}
    </Grid>
  );
}
