import { useState } from "react"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

type User = {
  id: number
  name: string
  email: string
  role: string
}

type Props = {
  users: User[]
  value: number[]
  onChange: (value: number[]) => void
  error?: string
  placeholder?: string
  loading?: boolean
}

export function MultiSelectCombobox({
  users,
  value = [],
  onChange,
  error,
  placeholder = "Selecciona usuarios...",
  loading = false,
}: Props) {
  const [open, setOpen] = useState(false)

  const toggleValue = (id: number) => {
    if (Array.isArray(value)) {
      onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])
    }
  }

  const selectedLabels =
    Array.isArray(value) && value.length > 0
      ? users
          .filter((user) => value.includes(user.id))
          .map((user) => user.name)
          .join(", ")
      : ""

  return (
    <div className="space-y-1 w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" className="w-full justify-between">
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" />
                Cargando...
              </span>
            ) : selectedLabels ? (
              selectedLabels
            ) : (
              placeholder
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar usuario..." />
            <CommandEmpty>No se encontraron usuarios.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem key={user.id} onSelect={() => toggleValue(user.id)}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      Array.isArray(value) && value.includes(user.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  {user.name} ({user.email})
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}
