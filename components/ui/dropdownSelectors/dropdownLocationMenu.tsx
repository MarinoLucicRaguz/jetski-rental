import { DrawingPinIcon } from '@radix-ui/react-icons';
import { Button } from '../button';
import { useState } from 'react';
import { Menu, MenuItem } from '@mui/material';
import { Location } from '@prisma/client';

interface LocationMenuProps {
  locations: Location[];
  onLocationSelect: (locationId: number | null) => void;
  includeAllLocations?: boolean;
}

export default function LocationMenu({ locations, onLocationSelect, includeAllLocations = true }: LocationMenuProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const open = Boolean(anchorEl);

  const handleClickListItem = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuItemClick = (event: React.MouseEvent<HTMLElement>, index: number | null) => {
    setSelectedIndex(index);
    if (index === null) {
      onLocationSelect(null);
    } else {
      onLocationSelect(locations[index].location_id);
    }
    setAnchorEl(null);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <header>
      <Button className="absolute right-5 top-5" variant="secondary" onClick={handleClickListItem}>
        <DrawingPinIcon className="mr-2" />
        {selectedIndex !== null ? locations[selectedIndex].location_name : 'Odaberi lokaciju'}
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {includeAllLocations && (
          <MenuItem
            key="all-locations"
            selected={selectedIndex === null}
            onClick={(event) => handleMenuItemClick(event, null)}
            style={{ width: '163px' }}
          >
            Sve lokacije
          </MenuItem>
        )}
        {locations.map((location, index) => (
          <MenuItem
            key={location.location_id}
            selected={index === selectedIndex}
            onClick={(event) => handleMenuItemClick(event, index)}
            style={{ width: '163px' }}
          >
            {location.location_name}
          </MenuItem>
        ))}
      </Menu>
    </header>
  );
}
