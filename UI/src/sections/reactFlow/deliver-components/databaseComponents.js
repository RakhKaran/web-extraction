import { useEffect, useState } from "react";
import { Grid, MenuItem, Typography, TextField, Stack } from "@mui/material";
import { RHFSelect } from "src/components/hook-form";
import axiosInstance from "src/utils/axios";

//Dummy Locate JSON schema
const locateSchema = {
  jobTitle: "Frontend Developer",
  companyName: "Tech Corp",
  city: "Pune",
  expYears: "3",
  compensation: "12 LPA",
  jobDesc: "Responsible for frontend development",
  technologies: "React, Node.js",
};

export default function DatabaseComponents() {
  const [dbFields, setDbFields] = useState([]);


  useEffect(() => {
    axiosInstance.get("/deliver/model/Deliver").then((res) => {
      if (res.data?.fields) {
        setDbFields(res.data.fields);
      }
    }).catch((err) => {
      console.error("Error fetching DB fields:", err);
    });
  }, []);

  return (
    <Grid item xs={12}>
      {dbFields.map((field) => (
        <Stack direction="row" spacing={2} key={field} sx={{ width: "100%", mt: 2 }}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              value={field}
              label="Field Name"
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={6}>
            <RHFSelect name={`mapping.${field}`} label="Extracted Field">
              {Object.keys(locateSchema).map((key) => (
                <MenuItem key={key} value={key}>
                  {key}
                </MenuItem>
              ))}
            </RHFSelect>
          </Grid>
        </Stack>
      ))}
    </Grid>
  );
}






