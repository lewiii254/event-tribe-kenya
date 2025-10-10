import { Button } from "@/components/ui/button";
import { Code, Music, Plane, PartyPopper, GraduationCap, Trophy, Palette, Grid } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { name: "All", icon: Grid },
  { name: "Tech", icon: Code },
  { name: "Music", icon: Music },
  { name: "Travel", icon: Plane },
  { name: "Parties", icon: PartyPopper },
  { name: "Campus", icon: GraduationCap },
  { name: "Sports", icon: Trophy },
  { name: "Art", icon: Palette },
];

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
}

const CategoryFilter = ({ selected, onSelect }: CategoryFilterProps) => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => {
        const Icon = category.icon;
        const isSelected = selected === category.name;
        
        return (
          <Button
            key={category.name}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onSelect(category.name)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-full transition-all",
              isSelected 
                ? "bg-primary text-primary-foreground shadow-lg scale-105" 
                : "hover:bg-muted hover:scale-105"
            )}
          >
            <Icon className="w-4 h-4" />
            {category.name}
          </Button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;
