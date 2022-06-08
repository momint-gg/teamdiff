import { Fab } from "@mui/material";

export default function ({ onClickHandler }) {
  return (
    <Fab
      variant="extended"
      size="medium"
      aria-label="back"
      style={{
        color: "#1d918a",
        position: "absolute",
        marginLeft: "3rem",
        marginTop: "1rem",
      }}
      onClick={onClickHandler}
    >
      &#60; BACK
    </Fab>
  );
}
