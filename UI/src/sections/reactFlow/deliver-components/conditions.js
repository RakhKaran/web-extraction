import { Button, IconButton, Stack, MenuItem } from "@mui/material";
import { useFieldArray, useFormContext } from "react-hook-form";
import { RHFTextField, RHFSelect } from "src/components/hook-form";
import Iconify from "src/components/iconify";

export default function Conditions({ index, type }) {
  const { control, watch } = useFormContext();

  const typesConditions = {
    string: [
      { conditionLabel: "Email", condition: "email", isValueNeeded: false },
      { conditionLabel: "Phone", condition: "phone", isValueNeeded: false },
      { conditionLabel: "Not Valid", condition: "notValid", isValueNeeded: true },
      { conditionLabel: "Min Length", condition: "minLength", isValueNeeded: true },
      { conditionLabel: "Max Length", condition: "maxLength", isValueNeeded: true },
    ],
    number: [
      { conditionLabel: "Min", condition: "min", isValueNeeded: true },
      { conditionLabel: "Max", condition: "max", isValueNeeded: true },
      { conditionLabel: "Positive", condition: "positive", isValueNeeded: false },
      { conditionLabel: "Negative", condition: "negative", isValueNeeded: false },
      { conditionLabel: "Integer", condition: "integer", isValueNeeded: false },
    ],
    boolean: [
      { conditionLabel: "Is True", condition: "isTrue", isValueNeeded: false },
      { conditionLabel: "Is False", condition: "isFalse", isValueNeeded: false },
    ],
    array: [
      { conditionLabel: "Min Length", condition: "min", isValueNeeded: true },
      { conditionLabel: "Max Length", condition: "max", isValueNeeded: true },
      { conditionLabel: "Includes", condition: "includes", isValueNeeded: true },
      { conditionLabel: "Unique", condition: "unique", isValueNeeded: false },
    ],
    object: [
      { conditionLabel: "Shape", condition: "shape", isValueNeeded: true },
      { conditionLabel: "No Unknown Keys", condition: "noUnknown", isValueNeeded: false },
      { conditionLabel: "Required Keys", condition: "requiredKeys", isValueNeeded: true },
    ],
    date: [
      { conditionLabel: "Min Date", condition: "min", isValueNeeded: true },
      { conditionLabel: "Max Date", condition: "max", isValueNeeded: true },
      { conditionLabel: "Before", condition: "before", isValueNeeded: true },
      { conditionLabel: "After", condition: "after", isValueNeeded: true },
    ],
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: `mapping.${index}.conditions`,
  });

  const availableConditions = typesConditions[type] || [];

  return (
    <Stack direction="column" spacing={1}>
      {fields.map((field, i) => {
        const selectedCondition = watch(`mapping.${index}.conditions[${i}].condition`);
        const conditionMeta = availableConditions.find(c => c.condition === selectedCondition);

        return (
          <Stack
            key={field.id}
            direction="row"
            spacing={1}
            sx={{
              ml: 4,
              borderLeft: "2px dashed lightgray",
              pl: 2,
              alignItems: "center",
            }}
          >
            {/* Dropdown for condition */}
            <RHFSelect
              name={`mapping.${index}.conditions[${i}].condition`}
              label="Condition"
              sx={{ minWidth: 180 }}
            >
              {availableConditions.map(opt => (
                <MenuItem key={opt.condition} value={opt.condition}>
                  {opt.conditionLabel}
                </MenuItem>
              ))}
            </RHFSelect>

            {/* Value field only if needed */}
            {conditionMeta?.isValueNeeded && (
              <RHFTextField
                type={type === "date" ? "date" : "text"} // show calendar if date type
                label="Value"
                name={`mapping.${index}.conditions[${i}].value`}
                InputLabelProps={type === "date" ? { shrink: true } : {}}
              />
            )}

            <IconButton color="error" onClick={() => remove(i)}>
              <Iconify icon="mdi:delete-outline" />
            </IconButton>
          </Stack>
        );
      })}

      <Stack direction="row" spacing={1} justifyContent="end">
        <Button
          variant="contained"
          onClick={() => append({ condition: "", value: "" })}
        >
          + Add Condition
        </Button>
      </Stack>
    </Stack>
  );
}
