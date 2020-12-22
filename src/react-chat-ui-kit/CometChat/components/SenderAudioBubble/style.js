export const messageContainerStyle = () => {

    return {
        alignSelf: "flex-end",
        marginBottom: "16px",
        paddingLeft: "16px",
        paddingRight: "16px",
        maxWidth: "65%",
        clear: "both",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        flexShrink: "0",
        ":hover": {
            "ul.message__actions": {
                display: "flex"
            }
        }
    }
}

export const messageWrapperStyle = () => {

    return {
        width: "auto",
        flex: "1 1",
        alignSelf: "flex-end",
        display: "flex",
    }
}

export const messageAudioWrapperStyle = (props) => {

    return {
        display: "inline-block",
        borderRadius: "12px",
        backgroundColor: `${props.theme.color.blue}`,
        padding: "8px 12px",
        alignSelf: "flex-end",
        ' > audio': {
            maxWidth: "250px",
            display: "inherit",
        }
    }
}

export const messageInfoWrapperStyle = () => {

    return {
        alignSelf: "flex-end",
    }
}