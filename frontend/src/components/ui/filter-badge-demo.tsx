import { FilterBadge } from "@/components/ui/filter-badge"

export function FilterBadgeDefault() {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      <FilterBadge 
        label="Department"
        value="Sales"
        onRemove={() => {}}
      />
      <FilterBadge 
        label="Location"
        value="Zurich"
        onRemove={() => {}}
      />
      <FilterBadge 
        label="Sales volume"
        value="$100K-5M"
        onRemove={() => {}}
      />
      <FilterBadge 
        label="Status"
        value="Closed"
        onRemove={() => {}}
      />
    </div>
  )
}
