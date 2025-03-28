import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import { Send } from "lucide-react"
import { useContext, useRef } from "react"
import { ChatContext } from "./ChatContext"


interface ChatInputProps {
  isDisabled?: boolean
}

// Component that contains the text input and the Send button
const ChatInput = ({isDisabled}: ChatInputProps) => {

  const {addMessage, handleInputChange, isLoading, message} = useContext(ChatContext)

  // Get ref of the text input so that we can focus the cursor on it
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  return (
    <div className="absolute bottom-0 left-0 w-full">
        <div className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
          <div className="relative flex h-full flex-1 items-stretch md:flex-col">
            <div className="relative flex flex-col w-full flex-grow p-4">
              <div className="relative">

                <Textarea
                  ref={textAreaRef}
                  placeholder="What subject would you like to compare between the two reports?"
                  autoFocus  // Place cursor inside input on pageload
                  onKeyDown={(e) => {if (e.key==="Enter" && !e.shiftKey){
                                      e.preventDefault()
                                      addMessage()
                                      textAreaRef.current?.focus()  // Prevent text input from losing focus
                                     }
                  }}
                  onChange={handleInputChange}  // Whenever the text changes, it is saved with useState inside the ChatContext
                  value={message}
                  rows={1}
                  maxRows={4}
                  className="resize-none pr-12 text-base py-3
                             scrollbar-thumb-blue scrollbar-thumb-rounded
                             scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch "/>
                
                <Button aria-label="send message"
                        disabled={isLoading || isDisabled}
                        className="absolute bottom-1.5 right-[8px]"
                        onClick={() => {
                          addMessage()
                          textAreaRef.current?.focus()
                        }}>
                  <Send className="h-4 w-4"/> {/* Inside the button, show an icon */}
                </Button>
                
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

export default ChatInput