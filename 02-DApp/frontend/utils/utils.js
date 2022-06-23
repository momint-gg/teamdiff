
export const getMatchupsUpToWeek = async (number, leagueProxyContractInput) => {
    const res = []
    for (let i = 0; i <= number; i++) {
      const schedule = await leagueProxyContractInput.getScheduleForWeek(i) // week number 0-index
      res.push(schedule)
    }
    return res
    }