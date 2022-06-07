import { Fragment } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  CardActions,
  Button,
  Avatar,
  Box,
} from "@mui/material";

export default function JoinCard({ joinData }) {
  const card = (
    <Fragment>
      <CardContent>
        <Box>
          <Typography variant="h5" color="secondary" component="div">
            {joinData?.leagueName}
          </Typography>
          {joinData?.invitedBy && (
            <Typography variant="body1" color="inherit">
              Invited By: {joinData?.invitedBy}
            </Typography>
          )}
          {joinData?.publicOwner && (
            <Typography variant="body1" color="inherit">
              Started By: {joinData?.publicOwner}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Fragment>
  );

  return (
    <Card variant="outlined" onClick={() => {}} sx={{ width: "25%" }}>
      {card}
    </Card>
  );
}
