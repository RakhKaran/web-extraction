import { Box, Button, Grid, IconButton, InputAdornment, MenuItem, Tooltip } from "@mui/material";
import PropTypes from "prop-types";
import { useFieldArray, useFormContext } from "react-hook-form"
import { RHFMultiSelect, RHFSelect, RHFTextField } from "src/components/hook-form";
import Iconify from "src/components/iconify";

const deduplicationAlgorithms = [
    {
        value: 'exact_match',
        label: 'Exact Match',
        description: 'Removes records with identical field values (e.g., same email or ID).',
    },
    {
        value: 'composite_match',
        label: 'Composite Match',
        description:
            'Detects duplicates based on a combination of multiple fields (e.g., First Name + Last Name + DOB).',
    },
    {
        value: 'fuzzy_match',
        label: 'Fuzzy Match',
        description:
            'Uses similarity algorithms (Levenshtein, Jaro-Winkler) to find near-duplicates (e.g., “Jon Smith” ≈ “John Smyth”).',
    },
    {
        value: 'phonetic_match',
        label: 'Phonetic Match',
        description:
            'Matches records that sound similar using phonetic encoding (Soundex, Metaphone).',
    },
    {
        value: 'hybrid_match',
        label: 'Hybrid / Weighted Match',
        description:
            'Combines exact, composite, and fuzzy logic with weighted scoring and thresholds.',
    },
];


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
                        <Grid item xs={12} md={4}>
                            <RHFMultiSelect
                                checkbox
                                name={`duplicatesConstraints[${index}].fields`}
                                label='Fields'
                                options={fieldsOpt.length > 0 ? fieldsOpt.map((dept) => ({
                                    value: dept.name,
                                    label: dept.name,
                                })) : []} />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <RHFSelect name={`duplicatesConstraints[${index}].algorithm`} label="Algorithm">
                                {deduplicationAlgorithms.map((opt) => (
                                    <MenuItem key={opt.value} value={opt.value}>
                                        
                                            {opt.label}
                                            <Tooltip title={opt.description} arrow>
                                                <IconButton size="small" >
                                                    <Iconify icon="mdi:information-outline" fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        
                                    </MenuItem>
                                ))}
                            </RHFSelect>


                        </Grid>
                        <Grid item xs={12} md={4}>
                            <RHFTextField name={`duplicatesConstraints[${index}].threshold`} label='Threshold' type='number' />
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