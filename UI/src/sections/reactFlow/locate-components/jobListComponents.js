// src/sections/reactFlow/locate-components/JobListFields.js

import { Grid, Button, MenuItem, Typography, Stack } from "@mui/material";
import { useFieldArray, useForm, useFormContext } from "react-hook-form";
import { RHFTextField, RHFSelect } from "src/components/hook-form";
import { useEffect, useMemo } from "react";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
// Dropdown options for selector types


export default function JobListFields() {

    const searchSelectorOptions = [
        { label: "ID", value: "id" },
        { label: "Class", value: "class" },
        { label: "CSS", value: "css" },
        { label: "XPath", value: "xpath" },
        { label: "Placeholder", value: "placeholder" },
        { label: "Role", value: "role" },
    ];

    const SelectorTypeOptions = [
        { label: "ID", value: "id" },
        { label: "Class", value: "class" },
        { label: "CSS", value: "css" },
        { label: "XPath", value: "xpath" },
        { label: "Placeholder", value: "placeholder" },
        { label: "List", value: "list" },
        { label: "Object", value: "object" }

    ];

    const JobSchema = Yup.object().shape({
        selector: Yup.object().shape({
            name: Yup.string().required("Selector name is required"),
            selectorType: Yup.string()
                .oneOf(searchSelectorOptions, "Invalid selector type")
                .required("Selector type is required"),
        }),

        fieldsArray: Yup.array().of(
            Yup.object().shape({
                fieldName: Yup.string().required("Field name is required"),
                selector: Yup.string().required("Selector is required"),
                selectorType: Yup.string()
                    .oneOf(SelectorTypeOptions, "Invalid selector type")
                    .required("Selector type is required"),
                attribute: Yup.string().required("Attribute is required"),
                children: Yup.lazy(() => JobSchema.fields.fieldsArray),
            })
        ),
    });

    const defaultValues = useMemo(
        () => ({
            fieldsArray: [],
        }),
        []
    );

    const methods = useForm({
        resolver: yupResolver(JobSchema),
        defaultValues,
    })

    const { control, setValue, getValues, watch, handleSubmit } = methods;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "fieldsArray",
    });
    const values = watch();

    // Auto-append one field if empty
    useEffect(() => {
        const currentFields = getValues("fieldsArray");
        if (!currentFields || currentFields.length === 0) {
            append({ fieldName: "", selector: "", attribute: "", selectorType: "" });
        }
    }, [append, getValues]);

    function generateRandomId() {
        return Math.random().toString(36).substring(2, 12);
    }

    const handleAddField = (type) => {
        console.log(type);
        // for normal text field...
        if (type === "list") {
            setValue('fieldsArray', [...values.items, {
                id: generateRandomId(),
                fieldName: "",
                selector: "",
                selectorType: "",
                attribute: "",
                children: [],
            }])
        }

        // for section...
        else if (type === 'object') {
            setValue('fieldsArray', [...values.items, {
                id: generateRandomId(),
                fieldName: "",
                selector: "",
                selectorType: "",
                attribute: "",
                children: [],
            }], { shouldValidate: true })
        }
    }
    const handleAddNestedField = (parentId, fieldType, condition) => {
        const newNestedField = {
            id: generateRandomId(),
            fieldName: "",
            selector: "",
            selectorType: "",
            attribute: "",
            children: [],
        };
const updatedItems = addNestedField(parentId, values.fieldsArray, newNestedField, condition);
    setValue('fieldsArray', updatedItems, { shouldValidate: true });
  };

    const addNestedField = (parentId, data, newField, condition) => 
    data.map((item) => {
      if (item.id === parentId) {
        return {
          ...item,
          options: item.options.map((opt) =>
            opt.id === condition
              ? { 
                  ...opt, 
                  nestedFields: [...(opt.nestedFields || []), newField] // Ensure nestedFields is an array
                }
              : opt
          ),
        };
      }
  
      if (item.options) {
        return {
          ...item,
          options: item.options.map((opt) => ({
            ...opt,
            nestedFields: addNestedField(parentId, opt.nestedFields || [], newField, condition),
          })),
        };
      }
  
      return item;
    });
        return (
            <Grid spacing={2}>
                {/* Selector Section */}
                <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
                        Parent Selector
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
                        <RHFTextField
                            fullWidth
                            name="selector.name"
                            label="Selector Name"
                            placeholder=".srp-jobtuple-wrapper .title"
                        />
                        <RHFSelect fullWidth name="selector.selectorType" label="Selector Type">
                            {searchSelectorOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </RHFSelect>
                    </Stack>
                </Grid>

                {/* Fields Section */}
                <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
                        Fields
                    </Typography>
                </Grid>
                {fields.map((field, index) => (
                    <Grid
                        container
                        spacing={2}
                        key={field.id}
                        sx={{ mb: 2 }}
                        alignItems="center"
                    >
                        <Grid item xs={12} md={3}>
                            <RHFTextField
                                fullWidth
                                name={`fieldsArray[${index}].fieldName`}
                                label="Field Name"
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <RHFTextField
                                fullWidth
                                name={`fieldsArray[${index}].selector`}
                                label="Selector"
                            />
                        </Grid>
                        <Grid item xs={12} md={2}>
                            <RHFSelect fullWidth name={`fieldsArray[${index}].selectorType`} label="Selector Type">
                                {SelectorTypeOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </RHFSelect>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <RHFTextField
                                fullWidth
                                name={`fieldsArray[${index}].attribute`}
                                label="Attribute"
                            />
                        </Grid>
                        <Grid
                            item
                            xs={12}
                            md={1}
                            sx={{ display: "flex", justifyContent: "flex-end" }}
                        >
                            <Button
                                onClick={() => remove(index)}
                                color="error"
                                size="small"
                                sx={{ whiteSpace: "nowrap" }}
                            >
                                Remove
                            </Button>
                        </Grid>
                    </Grid>
                ))}

                <Grid item xs={12}>
                    <Button
                        variant="outlined"
                        onClick={() =>
                            append({ fieldName: "", selector: "", attribute: "", selectorType: "" })
                        }
                    >
                        Add Field
                    </Button>
                </Grid>
            </Grid>
        );
    }
