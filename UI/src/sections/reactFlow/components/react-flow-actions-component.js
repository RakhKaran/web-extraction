import React from "react";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Stack,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import { useFieldArray, useFormContext } from "react-hook-form";
import { RHFSelect, RHFTextField } from "src/components/hook-form";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Iconify from "src/components/iconify";

export default function ActionsComponent() {
  const { control } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "actionFlow",
  });

  const actionTypeOptions = [
    { label: "Click", value: "click" },
    { label: "Data Extraction", value: "data" },
  ];

  // Handle drag reorder
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    move(result.source.index, result.destination.index);
  };

  return (
    <Stack direction="column" spacing={2}>
      <Typography variant="h6">Action Flow (Drag to Reorder)</Typography>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="actionFlow">
          {(provided) => (
            <Stack
              {...provided.droppableProps}
              ref={provided.innerRef}
              spacing={2}
            >
              {fields.map((field, index) => (
                <Draggable key={field.id} draggableId={field.id} index={index}>
                  {(provided, snapshot) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        boxShadow: snapshot.isDragging
                          ? "0 0 10px rgba(0,0,0,0.2)"
                          : "0 1px 3px rgba(0,0,0,0.0)",
                        backgroundColor: snapshot.isDragging
                          ? "#f8f9fa"
                          : "white",
                        transition: "0.2s",
                      }}
                    >
                      <Grid container spacing={1} alignItems="center">
                        {/* Drag Handle */}
                        <Grid
                          item
                          {...provided.dragHandleProps}
                          sx={{ display: "flex", alignItems: "center", pl: 1 }}
                        >
                          <Iconify
                            icon="mdi:drag"
                            width={22}
                            height={22}
                            style={{ cursor: "grab", color: "#888" }}
                          />
                        </Grid>

                        {/* Selector Field */}
                        <Grid item xs={12} md={5}>
                          <RHFTextField
                            name={`actionFlow[${index}].selector`}
                            label="Selector Name"
                            fullWidth
                          />
                        </Grid>

                        {/* Action Select */}
                        <Grid item xs={12} md={5}>
                          <RHFSelect
                            name={`actionFlow[${index}].action`}
                            label="Action"
                            fullWidth
                          >
                            {actionTypeOptions.map((action) => (
                              <MenuItem key={action.value} value={action.value}>
                                {action.label}
                              </MenuItem>
                            ))}
                          </RHFSelect>
                        </Grid>

                        {/* Delete Button */}
                        <Grid item xs={12} md={1}>
                          <IconButton
                            color="error"
                            onClick={() => remove(index)}
                            sx={{ ml: "auto" }}
                          >
                            <Iconify icon="mdi:trash-outline" width={22} />
                          </IconButton>
                        </Grid>
                      </Grid>
                    </Paper>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Stack>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Button */}
      <Box
        sx={{
            display: 'flex',
            justifyContent: 'end'
        }}
      >
        <Button
          variant="contained"
          onClick={() => append({ selector: "", action: "" })}
          startIcon={<Iconify icon="mdi:plus" />}
        >
          Add Action
        </Button>
      </Box>
    </Stack>
  );
}
