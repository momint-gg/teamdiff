import ViewLeagueTeamsTable from "../components/ViewLeagueTeamsTable"
import ViewLeagueTeamMatchup from "../components/ViewLeagueTeamMatchups"

const leagueName = "WashU Esports"
const teamNames = [
    "reggie",
    "trey",
    "will",
    "henry",
    "katie",
    "zach"
] 
const teamRecords = [
    "9-2-1",
    "9-2-1",
    "9-2-1",
    "9-2-1",
    "9-2-1",
    "9-2-1"   
]

const weeklyMatchups = {
    1: [{
        "reggie": 2,
        "trey": 2
    },
    {
        "katie": 2,
        "reggie": 3
    }],
    2: [{
        "katie": 2,
        "reggie": 3
    },
    {
        "reggie": 2,
        "trey": 2
    }],
    2: [{
        "zach": 2,
        "will": 3
    },
    {
        "henry": 2,
        "trey": 5
    }]
}

export default function TestReggie() {
    return (
        <>
            <ViewLeagueTeamsTable 
                leagueName={leagueName}
                teamNames={teamNames}
                teamRecords={teamRecords}
            />
            <ViewLeagueTeamMatchup 
                weekNumber={1}
                weeklyMatchups={weeklyMatchups}
            />
        </>
    )
}