import { yupResolver } from "@hookform/resolvers/yup";
import { LoadingButton } from "@mui/lab";
import { Button, Grid, IconButton, InputAdornment, Stack, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import PropTypes from "prop-types"
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import FormProvider, { RHFTextField } from "src/components/hook-form";
import Iconify from "src/components/iconify";
import axiosInstance from "src/utils/axios";
import * as Yup from 'yup';

export default function WorkflowInstanceCredentials({ handleClose, data }) {
    const { enqueueSnackbar } = useSnackbar();
    const [showSecret, setShowSecret] = useState(false);
    const [showToken, setShowToken] = useState(false);

    const newCredsSchema = Yup.object().shape({
        secretKey: Yup.string(),
        accessToken: Yup.string()
    });

    const defaultValues = useMemo(
        () => ({
            secretKey: data.secretKey || '',
            accessToken: data.shortLivedToken || ''
        }),
        [data]
    );

    const methods = useForm({
        resolver: yupResolver(newCredsSchema),
        defaultValues,
    });

    const {
        setValue,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const onSubmit = handleSubmit(async (formData) => {
        try {
            console.log(formData);
            const response = await axiosInstance.get(`/regenrate-token/${data?.id}`);
            if (response?.data) {
                setValue('accessToken', response.data, { shouldValidate: true });
            } else {
                enqueueSnackbar('failed to generate token', { variant: 'error' });
            }
        } catch (error) {
            console.error('Error while storing files', error)
        }
    });

    return (
        <FormProvider methods={methods} onSubmit={onSubmit}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="body1">API credentials</Typography>
                </Grid>
                <Grid item xs={12}>
                    <RHFTextField
                        name="secretKey"
                        label="Secret Key"
                        disabled
                        type={showSecret ? "text" : "password"}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => {
                                            navigator.clipboard.writeText(methods.getValues('secretKey'));
                                            enqueueSnackbar('Secret key copied!', { variant: 'success' });
                                        }}
                                        edge="end"
                                    >
                                        <Iconify icon="solar:copy-bold" />
                                    </IconButton>
                                    <IconButton onClick={() => setShowSecret((prev) => !prev)} edge="end">
                                        <Iconify icon={showSecret ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>

                <Grid item xs={12}>
                    <RHFTextField
                        name="accessToken"
                        label="Access Token"
                        disabled
                        type={showToken ? "text" : "password"}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => {
                                            navigator.clipboard.writeText(methods.getValues('accessToken'));
                                            enqueueSnackbar('Access token copied!', { variant: 'success' });
                                        }}
                                        edge="end"
                                    >
                                        <Iconify icon="solar:copy-bold" />
                                    </IconButton>
                                    <IconButton onClick={() => setShowToken((prev) => !prev)} edge="end">
                                        <Iconify icon={showToken ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
            </Grid>

            <Stack direction='row' spacing={1} sx={{ mt: 3, justifyContent: 'flex-end' }}>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                    Regenerate
                </LoadingButton>
                <Button onClick={handleClose} variant="contained">Close</Button>
            </Stack>
        </FormProvider>
    );
}

WorkflowInstanceCredentials.propTypes = {
    handleClose: PropTypes.func,
    data: PropTypes.object
}