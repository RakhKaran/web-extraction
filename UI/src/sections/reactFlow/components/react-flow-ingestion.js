import PropTypes from "prop-types";
import { useEffect, useMemo, useState } from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import CryptoJS from 'crypto-js';
import * as Yup from 'yup';
// eslint-disable-next-line import/no-extraneous-dependencies
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Button, Grid, MenuItem, Stack, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
// eslint-disable-next-line import/no-extraneous-dependencies
import FormProvider, { RHFSelect, RHFTextField } from "src/components/hook-form";
import ReactFlowCustomNodeStructure from "../react-flow-custom-node";
import { FTPComponent, HTTPComponent } from "../ingestion-components";
import CustomProcessDialogue from "./components-dialogue";
import LogsProcessDialogue from "./logs-dialogue";

export default function ReactFlowIngestion({ data }) {
    const [isOpen, setIsOpen] = useState(false);
    const [logsOpen, setLogsOpen] = useState(false);

    const NewInitializeSchema = Yup.object().shape({
        url: Yup.string()
            .required("URL is required")
            .matches(
                /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/\S*)?$/,
                "Enter a valid URL (like: www.example.com or http://example.com)"
            ),
        loginSessionEnabled: Yup.boolean().required('Please select whether to use login session or not'),
        storageStatePath: Yup.string().when("loginSessionEnabled", {
            is: true,
            then: (schema) => schema.required("Please add file name"),
            otherwise: (schema) => schema.notRequired(),
        }),
    });


    const defaultValues = useMemo(
        () => ({
            url: data.bluePrint?.data?.url || '',
            loginSessionEnabled: data.bluePrint?.data?.session?.enabled || false,
            storageStatePath: data.bluePrint?.data?.session?.storageStatePath || '',
        }),
        [data]
    );

    const methods = useForm({
        resolver: yupResolver(NewInitializeSchema),
        defaultValues,
    });

    const {
        reset,
        watch,
        control,
        setValue,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const values = watch();
    const onSubmit = handleSubmit(async (formData) => {
        const newData = {
            id: data.id,
            nodeName: data.label,
            type: data.type,
            data: {
                url: formData.url,
                headers: {
                    "User-Agent": "Mozilla/5.0",
                },
                session: {
                    enabled: formData.loginSessionEnabled,
                    storageStatePath: formData.storageStatePath,
                    load: formData.loginSessionEnabled ? true : false,
                    save: formData.loginSessionEnabled ? true : false,
                }
            }
        }
        data.functions?.handleBluePrintComponent?.(data.label, data.id, newData);
        handleCloseModal();
    });


    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    // Open modal
    const handleOpenModal = () => {
        setIsOpen(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setIsOpen(false);
    }

    // Open logs modal
    const handleOpenLogsModal = () => {
        setLogsOpen(true);
    };

    // Close logs modal
    const handleCloseLogsModal = () => {
        setLogsOpen(false);
    }

    return (
        <Stack sx={{ marginTop: 3 }} spacing={1} direction={'column'}>
            <ReactFlowCustomNodeStructure data={data} />
            <Typography variant='h5'>1. {data.label}</Typography>
            {(data?.isProcessInstance !== true) && <Button sx={{ width: '200px', color: 'royalBlue', borderColor: 'royalBlue' }} variant='outlined' onClick={() => handleOpenModal()}>Add Url</Button>}
            {(data?.isProcessInstance === true) && <Button sx={{ width: '200px', color: 'royalBlue', borderColor: 'royalBlue' }} variant='outlined' onClick={() => handleOpenLogsModal()}>View Logs</Button>}
            <CustomProcessDialogue
                isOpen={isOpen}
                handleCloseModal={handleCloseModal}
                title='Add Url'
            >
                <FormProvider methods={methods} onSubmit={onSubmit}>
                    <Grid container spacing={3}>
                        {/* URL Field */}
                        <Grid item xs={12}>
                            <RHFTextField name="url" label="Website URL" fullWidth />
                        </Grid>

                        {/* Session Management */}
                        <Grid item xs={12}>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                Session Management
                            </Typography>
                            <RHFSelect name="loginSessionEnabled" label="Login Session Enabled" fullWidth>
                                {[{ label: "True", value: true }, { label: "False", value: false }].map((opt) => (
                                    <MenuItem key={opt.value.toString()} value={opt.value}>
                                        {opt.label}
                                    </MenuItem>
                                ))}
                            </RHFSelect>
                        </Grid>

                        {/* Storage State Path (conditional field) */}
                        {values.loginSessionEnabled && (
                            <Grid item xs={12}>
                                <RHFTextField name="storageStatePath" label="Storage State File Name" fullWidth />
                            </Grid>
                        )}

                        {/* Submit Button */}
                        {data?.isProcessInstance !== true && (
                            <Grid item xs={12}>
                                <Stack alignItems="flex-end" sx={{ mt: 2 }}>
                                    <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                                        Add
                                    </LoadingButton>
                                </Stack>
                            </Grid>
                        )}
                    </Grid>
                </FormProvider>
            </CustomProcessDialogue>

            {/* logs modal */}
            <LogsProcessDialogue isOpen={logsOpen} handleCloseModal={handleCloseLogsModal} processInstanceId={14} nodeName={data.label} />
        </Stack>
    )
}

ReactFlowIngestion.propTypes = {
    data: PropTypes.object
}