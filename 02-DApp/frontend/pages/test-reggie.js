import PlayerStateModal from "../components/PlayerStateModal";

export default function TestReggie () {
    return (
        // <div>hello</div>
        <PlayerStateModal modalOpen={true} playerName={'shenyi'} 
        handleModalClose={() => console.log('close')} />
    )
} 