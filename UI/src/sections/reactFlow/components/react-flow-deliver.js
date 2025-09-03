import { useEffect, useMemo, useState } from "react";
// eslint-disable-next-line import/no-extraneous-dependencies
import CryptoJS from 'crypto-js';
import PropTypes from "prop-types";
import * as Yup from 'yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { Button, Grid, MenuItem, Stack, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import FormProvider, { RHFSelect } from "src/components/hook-form";
import ReactFlowCustomNodeStructure from "../react-flow-custom-node";
import { FTPComponent, HTTPComponent } from "../deliver-components";
import CustomProcessDialogue from "./components-dialogue";
import LogsProcessDialogue from "./logs-dialogue";

// channel options
const channelOptions = [
    { label: 'FTP', value: 'ftp', isDisabled: false },
    { label: 'API', value: 'api', isDisabled: true },
    { label: 'HTTP/HTTPS', value: 'http', isDisabled: false },
    { label: 'CRM Connectors', value: 'crm', isDisabled: false },
    { label: 'Task Manager Connectors', value: 'task-manager', isDisabled: false },
    { label: 'Workflow Connectors', value: 'workflow', isDisabled: false },
]

// const channelSchemas
const channelSchemas = {
    ftp: Yup.object().shape({
        path: Yup.string().required('FTP path is required'),
    }),
    api: Yup.object().shape({
        endpoint: Yup.string().url('Invalid URL').required('Endpoint is required'),
        token: Yup.string().required('Token is required'),
    }),
    http: Yup.object().shape({
        url: Yup.string().url('Invalid URL').required('URL is required'),
    }),
};

const getValidationSchema = (channelType) =>
    Yup.object().shape({
        channelType: Yup.string().required('Channel Type is required'),
        ...(channelSchemas[channelType] ? channelSchemas[channelType].fields : {}),
    });

// switch case functions
function Switch({ opt }) {
    let component;

    switch (opt) {
        case 'ftp':
            component = <FTPComponent />;
            break;

        case 'http':
            component = <HTTPComponent />;
            break;

        default:
            component = <div />
    }

    return (
        <>{component}</>
    )
}

Switch.propTypes = {
    opt: PropTypes.string,
}

// getComponent to show
const getComponent = (values = {}) => {
    const { channelType, host, path, url } = values;

    switch (channelType) {
        case 'ftp':
            return <Typography variant="body1">{`${host}/${path}`}</Typography>;

        case 'http':
            return <Typography variant="body1">{url}</Typography>;

        default:
            return null;
    }
};

function encryptPassword(password) {
    const secretKey = process.env.REACT_APP_SECRET_KEY;

    if (!secretKey || secretKey.length < 32) {
        throw new Error('Invalid AES secret key. Must be 32 characters for AES-256.');
    }

    const key = CryptoJS.enc.Utf8.parse(secretKey); // 32-byte key
    const iv = CryptoJS.lib.WordArray.random(16); // 16-byte IV

    const encrypted = CryptoJS.AES.encrypt(password, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    // Combine IV + ciphertext and encode in Base64
    const encryptedWithIV = iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);
    return encryptedWithIV;
}

export default function ReactFlowDeliver({ data }) {
    const [isOpen, setIsOpen] = useState(false);
    const [logsOpen, setLogsOpen] = useState(false);

    const [dynamicSchema, setDynamicSchema] = useState(getValidationSchema(''));

    const defaultValues = useMemo(
        () => ({
            channelType: data.bluePrint?.channelType || '',
            path: data.bluePrint?.path || '',
            host: data.bluePrint?.host || '',
            userName: data.bluePrint?.userName || '',
            password: '',
            url: data.bluePrint?.url || '',
        }),
        [data]
    );

    const methods = useForm({
        resolver: yupResolver(dynamicSchema),
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
    console.log('values', values);

    const onSubmit = handleSubmit(async (formData) => {
        console.log(formData);
        let newFormData = formData;
        if (formData.channelType && formData.channelType === 'ftp') {
            const pass = formData.password;
            const hash = encryptPassword(pass);
            newFormData = { ...formData, password: hash };
        }
        data.functions.handleBluePrintComponent(data.label, { ...newFormData });
        handleCloseModal();
    })

    useEffect(() => {
        setDynamicSchema(getValidationSchema(values.channelType));
    }, [values.channelType]);

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
        <Stack sx={{ marginTop: 3 }} spacing={1}>
            <ReactFlowCustomNodeStructure data={data} />
            <Typography variant='h5'>5. {data.label}</Typography>
            {values.channelType !== '' && <Typography variant='h6'>{channelOptions.find((channel) => channel.value === values.channelType).label}</Typography>}
            {getComponent(values)}
            {
                (data?.isProcessInstance !== true) ?
                    <Button sx={{ width: '200px', color: 'royalBlue', borderColor: 'royalBlue' }} variant='outlined' onClick={() => handleOpenModal()}>Add Destination</Button>
                    :
                    <Button sx={{ width: '200px', color: 'royalBlue', borderColor: 'royalBlue' }} variant='outlined' onClick={() => console.log('Output Data')}>Show Output data</Button>
            }
            {(data?.isProcessInstance === true) && <Button sx={{ width: '200px', color: 'royalBlue', borderColor: 'royalBlue' }} variant='outlined' onClick={() => handleOpenLogsModal()}>View Logs</Button>}

            <CustomProcessDialogue
                isOpen={isOpen}
                handleCloseModal={handleCloseModal}
                title='Add Channel'
            >
                <FormProvider methods={methods} onSubmit={onSubmit}>
                    <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid item xs={12} md={12}>
                            <RHFSelect name='channelType' label='Channel Type'>
                                {(channelOptions && channelOptions.length) > 0 ? channelOptions.map((channel) => (
                                    <MenuItem key={channel.value} value={channel.value} disabled={channel.isDisabled}>{channel.label}</MenuItem>
                                )) : (
                                    <MenuItem value=''>No channels found</MenuItem>
                                )}
                            </RHFSelect>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container spacing={1}>
                                <Switch opt={values.channelType} onClose={handleCloseModal} />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Stack alignItems="flex-end" sx={{ mt: 3, display: 'flex', gap: '10px' }}>
                        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                            Add
                        </LoadingButton>
                    </Stack>
                </FormProvider>
            </CustomProcessDialogue>

            {/* logs modal */}
            <LogsProcessDialogue isOpen={logsOpen} handleCloseModal={handleCloseLogsModal} processInstanceId={14} nodeName={data.label} />
        </Stack>
    )
}

ReactFlowDeliver.propTypes = {
    data: PropTypes.object,
}
