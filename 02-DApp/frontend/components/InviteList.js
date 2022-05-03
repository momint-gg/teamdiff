function InviteList() {
    return (
        <>
              {/* https://bapunawarsaddam.medium.com/add-and-remove-form-fields-dynamically-using-react-and-react-hooks-3b033c3c0bf5 */}
                {inviteListValues.map((element, index) => (
                  <>
                  <TextField
                    variant="standard"
                    label={"Player " + (index + 1) + (index === 0 ? " (League Admin)" : "")} 
                    onChange={e => handlePlayerInviteInput(e, index)}
                    value={element}
                    key={index}
                  />
                  {index ? 
                    <Button 
                      variant="outlined"
                      onClick={() => removePlayer(index)}
                      size="small"
                    >
                      Remove
                    </Button>
                    : null
                  }
                  </>
                ))}
                <Button 
                  variant="outlined"
                  onClick={addNewPlayerInviteInput}
                  size="small"
                  disabled={!addPlayerBtnEnabled}
                >
                  Add Another Player
                </Button>


              </>
    )

}

export default InviteList