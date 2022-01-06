import { Channel , ConsumeMessage} from "amqplib";


export default (channel : Channel) => {
    channel.consume('adminQueue' , (msg : ConsumeMessage | null) => {
        const MSG : any = msg?.content
        console.log('message recieved from superAdminQueue' , JSON.parse(MSG?.toString()))
    } , {noAck : true})
}