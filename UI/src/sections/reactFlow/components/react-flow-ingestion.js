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

// channel options
const channelOptions = [
    { label: 'FTP', value: 'ftp', isDisabled: false },
    { label: 'API', value: 'api', isDisabled: false },
    { label: 'WEBHOOK', value: 'webhook', isDisabled: true },
    { label: 'UI/PORTAL', value: 'ui', isDisabled: false },
]

// const channelSchemas
const channelSchemas = {
    ftp: Yup.object().shape({
        path: Yup.string().required('FTP path is required'),
        host: Yup.string().required("FTP Host is required"),
        password: Yup.string().required("FTP Password is required"),
        userName: Yup.string().required("FTP Username is required"),
    }),
    // http: Yup.object().shape({
    //     url: Yup.string().url('Invalid URL').required('URL is required'),
    // }),
};

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

export default function ReactFlowIngestion({ data }) {
    const [isOpen, setIsOpen] = useState(false);
    const [logsOpen, setLogsOpen] = useState(false);
    const [dynamicSchema, setDynamicSchema] = useState(getValidationSchema(''));


    const NewInitializeSchema = Yup.object().shape({
       url: Yup.string().required('Url is required'),

     });

    const defaultValues = useMemo(
        () => ({
            url: data.bluePrint?.url || '',
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
            <Typography variant='h5'>1. {data.label}</Typography>
           
            {getComponent(values)}
            {(data?.isProcessInstance !== true) && <Button sx={{ width: '200px', color: 'royalBlue', borderColor: 'royalBlue' }} variant='outlined' onClick={() => handleOpenModal()}>Add Url</Button>}
            {(data?.isProcessInstance === true) && <Button sx={{ width: '200px', color: 'royalBlue', borderColor: 'royalBlue' }} variant='outlined' onClick={() => handleOpenLogsModal()}>View Logs</Button>}
            <CustomProcessDialogue
                isOpen={isOpen}
                handleCloseModal={handleCloseModal}
                title='Add Url'
            >
                <FormProvider methods={methods} onSubmit={onSubmit}>
                     <Grid item xs={12} md={12}>
                                <RHFTextField name='url' label='URL' />
                            </Grid>
                    {(data?.isProcessInstance !== true) && <Stack alignItems="flex-end" sx={{ mt: 3, display: 'flex', gap: '10px' }}>
                        <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                            Add
                        </LoadingButton>
                    </Stack>}
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