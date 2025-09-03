import { useEffect, useMemo, useState } from "react";
import * as Yup from 'yup';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import PropTypes from "prop-types"
import { Box, Button, Chip, Grid, MenuItem, Stack, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import FormProvider, { RHFAutocomplete, RHFSelect, RHFTextField } from "src/components/hook-form";
// import { useGetDocumentTypes } from "src/api/documentType";
import ReactFlowCustomNodeStructure from "../react-flow-custom-node"
import CustomProcessDialogue from "./components-dialogue";
import { GenAIComponent } from "../extract-components";
import LogsProcessDialogue from "./logs-dialogue";

// Model options
const modelOptions = [
    { label: "ML", value: "ml", isDisabled: true },
    { label: "Gen AI", value: "name", isDisabled: false },
    { label: "Computer Vision", value: "computervision", isDisabled: true },
    { label: "NLP", value: "nlp", isDisabled: true },
];

// extractor schema...
const extractorSchemas = {
    name: Yup.array()
        .of(
            Yup.object().shape({
                prompt: Yup.string().required("Prompt is required"),
                variableName: Yup.string().required("Variable Name is required"),
            })
        )
        .min(1, "At least one extractor field is required"),
};

// get validation schema
const getValidationSchema = (formValues) => {
    const extractorShape = {};
    const extractorFieldShape = {};

    formValues?.categories?.forEach((cat) => {
        const catId = String(cat.id);
        const extractor = formValues?.extractors?.[catId];

        // Dynamic validation for each extractor
        extractorShape[catId] = Yup.string().required("Extractor is required");

        // Dynamic validation for extractorFields based on schema
        if (extractor && extractorSchemas[extractor]) {
            extractorFieldShape[catId] = extractorSchemas[extractor];
        }
    });

    return Yup.object().shape({
        categories: Yup.array().of(Yup.object()).min(1, "Please select category"),
        extractors: Yup.object().shape(extractorShape),
        extractorFields: Yup.object().shape(extractorFieldShape),
    });
};

// switch case functions
function ExtractorSwitch({ opt, catId }) {
    let component;
    switch (opt) {
        case 'name':
            component = <GenAIComponent namePrefix={`extractorFields.${catId}`} />;
            break;

        default:
            component = <div />
    }

    return (
        <>{component}</>
    )
}

ExtractorSwitch.propTypes = {
    opt: PropTypes.string,
    catId: PropTypes.string.isRequired,
};

export default function ReactFlowExtract({ data }) {
    const [isOpen, setIsOpen] = useState(false);
    const [logsOpen, setLogsOpen] = useState(false);
    const [documentTypesData, setDocumentTypesData] = useState([{
        documentType: 'Frontend Developer',
        id: 1,
    },
    {
        documentType: 'BackEnd Developer',
        id: 2,
    }]);
    // const { documentTypes, documentTypesEmpty } = useGetDocumentTypes();

    // useEffect(() => {
    //     if (documentTypes && !documentTypesEmpty) {
    //         setDocumentTypesData(documentTypes);
    //     }
    // }, [documentTypes, documentTypesEmpty]);

    const NewSearchSchema = Yup.object().shape({
        searchText: Yup.string().required("Search text is required"),
        selector: Yup.object().shape({
            name: Yup.string().required("Selector name is required"),
            selectorType: Yup.string().required("Selector type is required"),
        }),
    });

    const defaultValues = useMemo(() => ({
        searchText: data?.bluePrint?.searchText || [],
        name: data?.bluePrint?.name || [],
        selectorType: data?.bluePrint?.selectorType || [],
    }), [data])

    const methods = useForm({
        resolver: yupResolver(NewSearchSchema),
        defaultValues,
    });



    const {
        reset,
        watch,
        control,
        setValue,
        handleSubmit,
        formState: { isSubmitting, errors },
    } = methods;

    const values = watch();

    const onSubmit = handleSubmit(async (formData) => {
        console.log(formData);
        data.functions.handleBluePrintComponent(data.label, { ...formData });
        handleCloseModal();
    })

    useEffect(() => {
        reset(defaultValues);
    }, [defaultValues, reset]);

    const handleOpenModal = () => setIsOpen(true);
    const handleCloseModal = () => setIsOpen(false);

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
            <Typography variant='h5'>2. {data.label}</Typography>
            {(data?.isProcessInstance !== true) && <Button
                sx={{ width: "200px", color: "royalBlue", borderColor: "royalBlue" }}
                variant="outlined"
                onClick={handleOpenModal}
            >
                Search Here
            </Button>}
            {(data?.isProcessInstance === true) && <Button sx={{ width: '200px', color: 'royalBlue', borderColor: 'royalBlue' }} variant='outlined' onClick={() => handleOpenLogsModal()}>View Logs</Button>}

            {/* Dialog */}
            <CustomProcessDialogue
                title="Search"
                isOpen={isOpen}
                handleCloseModal={handleCloseModal}
            >
                <FormProvider methods={methods} onSubmit={onSubmit}>
                    <Grid container spacing={1}>
                        <Grid item xs={12} md={12}>
                            <RHFAutocomplete
                                name="searchText"
                                label="searchText"
                                multiple
                                disableCloseOnSelect
                                options={modelOptions || []}
                                getOptionLabel={(doc) => doc?.value || ''}
                                isOptionEqualToValue={(doc, value) => doc?.id === value?.id}
                                renderOption={(props, doc) => (
                                    <li {...props} key={doc.id}>
                                        {doc.value}
                                    </li>
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip label={option.value} {...getTagProps({ index })} />
                                    ))
                                }
                            />
                        </Grid>

                        {/* Document Category fields */}
                        {values.searchText && values.searchText.length > 0 && values.searchText.map((cat) => (
                            <>
                                <Grid item xs={12} md={12}>
                                    <Typography variant="heading1">{cat?.documentType}</Typography>
                                </Grid>
                                <Grid item xs={12} md={12}>
                                    <RHFSelect name={`extractors.${cat.id}`} label="Select Extractor" >
                                        {modelOptions.map((model) => (
                                            <MenuItem key={model.value} value={model.value} disabled={model.isDisabled}>
                                                {model.label}
                                            </MenuItem>
                                        ))}
                                    </RHFSelect>
                                </Grid >
                                <Box sx={{ width: '100%', mt: '20px' }}>
                                    <ExtractorSwitch opt={values?.extractors?.[cat.id]} catId={cat?.id} />
                                </Box>
                            </>
                        ))}
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
        </Stack >
    )
}

ReactFlowExtract.propTypes = {
    data: PropTypes.object
}