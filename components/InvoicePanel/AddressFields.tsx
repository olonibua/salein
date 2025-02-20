import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface AddressFieldsProps {
  showAddress: boolean;
  onShowAddressChange: (show: boolean) => void;
  values: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
  };
  onChange: (field: string, value: string) => void;
}

export function AddressFields({
  showAddress,
  onShowAddressChange,
  values,
  onChange,
}: AddressFieldsProps) {
  const handleAddressChange = (field: string, value: string) => {
    onChange(`address.${field}`, value);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-600">Show address</label>
        <Switch checked={showAddress} onCheckedChange={onShowAddressChange} />
      </div>

      {showAddress && (
        <div className="space-y-4">
          <div>
            <Input
              placeholder="Street"
              value={values.street || ""}
              onChange={(e) => handleAddressChange("street", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              placeholder="City"
              value={values.city || ""}
              onChange={(e) => handleAddressChange("city", e.target.value)}
            />
            <Input
              placeholder="State"
              value={values.state || ""}
              onChange={(e) => handleAddressChange("state", e.target.value)}
            />
            <Input
              placeholder="Postal code"
              value={values.postalCode || ""}
              onChange={(e) => handleAddressChange("postalCode", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
