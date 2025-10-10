import { Box, Button, Grid, MenuItem } from "@mui/material";
import PropTypes from "prop-types";
import { useFieldArray, useFormContext } from "react-hook-form"
import { RHFMultiSelect, RHFSelect, RHFTextField } from "src/components/hook-form";

export default function DuplicatesValidationSection({ fieldsOpt = [] }) {
    console.log('fieldsOpt', fieldsOpt);
    const { control, watch } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'duplicatesConstraints'
    });

    const values = watch();
    return (
        <>
            <Grid container spacing={1}>
                {fields.map((field, index) => (
                    <>
                        <Grid item xs={12} md={3}>
                            <RHFMultiSelect
                                checkbox
                                name={`duplicatesConstraints[${index}].fields`}
                                label='Fields'
                                options={fieldsOpt.length > 0 ? fieldsOpt.map((dept) => ({
                                    value: dept.id,
                                    label: dept.name,
                                })) : []} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <RHFTextField name={`duplicatesConstraints[${index}].type`} label='Type' />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <RHFTextField name={`duplicatesConstraints[${index}].algorithm`} label='Algorithm' />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <RHFTextField name={`duplicatesConstraints[${index}].threshold`} label='Threshold' />
                        </Grid>
                    </>
                ))}
                <Box sx={{ mt: 1 }}>
                    <Button
                        variant="contained"
                        onClick={() =>
                            append({
                                fields: [],
                                type: "",
                                algorithm: "",
                                threshold: "",
                            })
                        }
                    >
                        + Add Constraint
                    </Button>
                </Box>
            </Grid>
        </>
    )
}

DuplicatesValidationSection.propTypes = {
    fieldsOpt: PropTypes.array,
}