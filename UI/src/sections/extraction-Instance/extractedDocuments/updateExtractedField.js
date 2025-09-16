import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import * as Yup from 'yup';
import CustomProcessDialogue from "src/sections/reactFlow/components/components-dialogue";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import FormProvider, { RHFTextField } from "src/components/hook-form";
import { Grid, Stack } from "@mui/material";
import axiosInstance from "src/utils/axios";
import { useSnackbar } from "notistack";
import { LoadingButton } from "@mui/lab";

export default function UpdateExtractedFieldsModal({ isOpen, handleCloseModal, data, setDocumentsData }) {
    const [dynamicSchema, setDynamicSchema] = useState(null);
    const [defaultValues, setDefaultValues] = useState(null);
    const { enqueueSnackbar } = useSnackbar();

    const methods = useForm({
        resolver: dynamicSchema ? yupResolver(dynamicSchema) : undefined,
        defaultValues: defaultValues || {},
    });

    const {
        reset,
        watch,
        control,
        setValue,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    useEffect(() => {
        if (isOpen && data && data.extractedFields) {
            const schemaShape = {};
            const defaults = {};

            data?.extractedFields?.forEach((field) => {
                schemaShape[field?.fieldName] = Yup.string().required(`${field?.fieldName} is required`);
                defaults[field?.fieldName] = field?.fieldValue || '';
            });

            const builtSchema = Yup.object().shape(schemaShape);

            setDynamicSchema(builtSchema);
            setDefaultValues(defaults);

            reset(defaults);
        }
    }, [data, reset, isOpen]);

    const onSubmit = handleSubmit(async (formData) => {
        try {
            console.log('formData', formData);
            const extractedArray = Object.entries(formData).map(([key, value]) => ({
                fieldName: key,
                fieldValue: value
            }));
            const response = await axiosInstance.patch(`/process-instance-documents/${data?.id}`, { extractedFields: extractedArray, isHumanUpdated: true, overAllScore: undefined });
            if (response?.data?.success) {
                setDocumentsData((prev) => prev.map((doc) => {
                    if (doc.id === data.id) {
                        return {
                            ...doc,
                            extractedFields: extractedArray,
                            isHumanUpdated: true,
                            overAllScore: undefined,
                        }
                    }
                    return doc;

                }));
                enqueueSnackbar('Update success', { variant: 'success' });
                handleCloseModal();
                reset();
            }
        } catch (error) {
            console.error('error while updating fields', error);
        }
    })

    return (
        <CustomProcessDialogue
            isOpen={isOpen}
            handleCloseModal={handleCloseModal}
            title="Update Fields"
        >
            <FormProvider methods={methods} onSubmit={onSubmit}>
                <Grid container spacing={1}>
                    {Object.keys(defaultValues || {}).map((fieldName) => (
                        <Grid item xs={12} md={6} key={fieldName}>
                            <RHFTextField multiline rows={3} name={fieldName} label={fieldName} />
                        </Grid>
                    ))}
                </Grid>
                <Stack alignItems="flex-end" sx={{ mt: 3, display: 'flex', gap: '10px' }}>
                    <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                        Add
                    </LoadingButton>
                </Stack>
            </FormProvider>
        </CustomProcessDialogue>
    )
}

UpdateExtractedFieldsModal.propTypes = {
    isOpen: PropTypes.bool,
    handleCloseModal: PropTypes.func,
    data: PropTypes.object,
    setDocumentsData: PropTypes.func
}