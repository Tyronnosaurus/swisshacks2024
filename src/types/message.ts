import { AppRouter } from "@/trpc"
import { inferRouterOutputs } from "@trpc/server"

/* The message type created by prisma has more members than we need to show the messages in the chat.
   Therefore we create this smaller type. 
   Only Typescript related stuff goes here. We'll use some advanced tRPC magic.*/


// Infer the output of any route that we have in tRPC
type RouterOutput = inferRouterOutputs<AppRouter>

// See /src/trpc/index.ts -> We have the getFileMessages route, which returns {messages, nextCursor}
// We infer a new type from messages. If it changes, this type will automatically change as well (i.e. it's very maintainable)
type Messages = RouterOutput["getFileMessages"]["messages"]


// In Messages.tsx we have a loadingMessage object that we want to show on the chat just like any other message.
// Unlike the other messages, it renders JSX rather than a string. We need to accomodate for that.

// Create a type derived from Messages, but remove the 'text' property because it only accepts string.
// (Messages is an array, but by using Messages[number] we get the type of its elements).
type OmitText = Omit<Messages[number], "text">

// Now create a new type that has a text property that can accomodate for either string of JSX.
type ExtendedText = {
    text: string | JSX.Element
}

// Finally, combine the infered type from which we removed 'text' with the new type that has 'text'
export type ExtendedMessage = OmitText & ExtendedText