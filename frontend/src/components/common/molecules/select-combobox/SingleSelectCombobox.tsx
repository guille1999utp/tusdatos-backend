import {
    Popover,
    PopoverTrigger,
    PopoverContent,
  } from "@/components/ui/popover";
  import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
  } from "@/components/ui/command";
  import { Button } from "@/components/ui/button";
  import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
  import { cn } from "@/lib/utils";
  import { useState } from "react";
  
  type Option = {
    label: string;
    value: number;
  };
  
  type Props = {
    options: Option[];
    value?: number; // valor seleccionado (opcional)
    onChange: (value: number) => void;
    error?: string;
    placeholder?: string;
    loading?: boolean;
  };
  
  export function SingleSelectCombobox({
    options,
    value,
    onChange,
    error,
    placeholder = "Selecciona una opción...",
    loading = false,
  }: Props) {
    const [open, setOpen] = useState(false);
  
    const selectedLabel = options.find((opt) => opt.value === value)?.label;
  
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
              ) : selectedLabel ? (
                selectedLabel
              ) : (
                placeholder
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Buscar..." />
              <CommandEmpty>No se encontraron opciones.</CommandEmpty>
              <CommandGroup>
                {options.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    onSelect={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === opt.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
    );
  }
  