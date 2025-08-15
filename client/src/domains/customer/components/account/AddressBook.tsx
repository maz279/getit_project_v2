/**
 * AddressBook.tsx - Amazon.com/Shopee.sg-Level Address Management
 * GetIt Bangladesh Multi-Vendor E-commerce Platform
 * 
 * Complete address management with Bangladesh geographic integration,
 * delivery zone mapping, and Amazon.com/Shopee.sg-level functionality.
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Badge } from '@/shared/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Switch } from '@/shared/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/shared/ui/alert-dialog';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Home, 
  Building, 
  Star, 
  Truck, 
  Clock, 
  Phone,
  User,
  CheckCircle,
  AlertCircle,
  Navigation,
  Globe,
  Flag
} from 'lucide-react';

// Bangladesh-specific icons
import { FaFlag } from 'react-icons/fa';

import { userApiService } from '@/shared/services/user/UserApiService';
import { ShippingApiService } from '@/shared/services/shipping/ShippingApiService';
import { useToast } from '@/shared/hooks/use-toast';

interface AddressBookProps {
  userId?: string;
  onAddressSelect?: (address: Address) => void;
  selectionMode?: boolean;
}

interface Address {
  id: string;
  type: 'home' | 'office' | 'other';
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  division: string;
  district: string;
  upazila: string;
  postalCode: string;
  isDefault: boolean;
  isActive: boolean;
  deliveryInstructions?: string;
  courierPreference?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  verified: boolean;
  createdAt: string;
}

interface BangladeshLocation {
  divisions: Array<{
    id: string;
    name: string;
    nameBn: string;
    districts: Array<{
      id: string;
      name: string;
      nameBn: string;
      upazilas: Array<{
        id: string;
        name: string;
        nameBn: string;
        postalCodes: string[];
      }>;
    }>;
  }>;
}

interface DeliveryZone {
  zone: 'standard' | 'express' | 'remote';
  courierServices: string[];
  estimatedDays: string;
  additionalCharge: number;
}

const AddressBook: React.FC<AddressBookProps> = ({ 
  userId, 
  onAddressSelect, 
  selectionMode = false 
}) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [bangladeshLocations, setBangladeshLocations] = useState<BangladeshLocation | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone | null>(null);

  const [formData, setFormData] = useState<Partial<Address>>({
    type: 'home',
    name: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    landmark: '',
    division: '',
    district: '',
    upazila: '',
    postalCode: '',
    deliveryInstructions: '',
    courierPreference: '',
    isDefault: false
  });

  const { toast } = useToast();

  useEffect(() => {
    loadAddresses();
    loadBangladeshLocations();
  }, [userId]);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const userAddresses = await userApiService.getAddresses();
      setAddresses(userAddresses);
    } catch (error) {
      console.error('Error loading addresses:', error);
      toast({
        title: "Error",
        description: "Failed to load addresses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadBangladeshLocations = async () => {
    try {
      // Mock Bangladesh location data - would come from actual service
      const locations: BangladeshLocation = {
        divisions: [
          {
            id: 'dhaka',
            name: 'Dhaka',
            nameBn: 'ঢাকা',
            districts: [
              {
                id: 'dhaka-district',
                name: 'Dhaka',
                nameBn: 'ঢাকা',
                upazilas: [
                  {
                    id: 'dhanmondi',
                    name: 'Dhanmondi',
                    nameBn: 'ধানমন্ডি',
                    postalCodes: ['1205', '1207', '1209']
                  },
                  {
                    id: 'gulshan',
                    name: 'Gulshan',
                    nameBn: 'গুলশান',
                    postalCodes: ['1212', '1213', '1214']
                  },
                  {
                    id: 'uttara',
                    name: 'Uttara',
                    nameBn: 'উত্তরা',
                    postalCodes: ['1230', '1231', '1232']
                  }
                ]
              }
            ]
          },
          {
            id: 'chittagong',
            name: 'Chittagong',
            nameBn: 'চট্টগ্রাম',
            districts: [
              {
                id: 'chittagong-district',
                name: 'Chittagong',
                nameBn: 'চট্টগ্রাম',
                upazilas: [
                  {
                    id: 'panchlaish',
                    name: 'Panchlaish',
                    nameBn: 'পাঁচলাইশ',
                    postalCodes: ['4203', '4204']
                  }
                ]
              }
            ]
          }
        ]
      };
      setBangladeshLocations(locations);
    } catch (error) {
      console.error('Error loading Bangladesh locations:', error);
    }
  };

  const checkDeliveryZone = async (postalCode: string) => {
    try {
      const zone = await ShippingApiService.getDeliveryZone(postalCode);
      setDeliveryZone(zone);
    } catch (error) {
      console.error('Error checking delivery zone:', error);
    }
  };

  const handleSaveAddress = async () => {
    try {
      setLoading(true);
      
      // Validate required fields
      if (!formData.name || !formData.phone || !formData.addressLine1 || 
          !formData.division || !formData.district || !formData.upazila || !formData.postalCode) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      let savedAddress: Address;
      
      if (selectedAddress) {
        // Update existing address
        savedAddress = await userApiService.updateAddress(selectedAddress.id, formData);
        setAddresses(prev => prev.map(addr => 
          addr.id === selectedAddress.id ? savedAddress : addr
        ));
        setIsEditModalOpen(false);
        toast({
          title: "Success",
          description: "Address updated successfully",
        });
      } else {
        // Create new address
        savedAddress = await userApiService.createAddress(formData);
        setAddresses(prev => [...prev, savedAddress]);
        setIsAddModalOpen(false);
        toast({
          title: "Success",
          description: "Address added successfully",
        });
      }

      // Reset form
      setFormData({
        type: 'home',
        name: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        division: '',
        district: '',
        upazila: '',
        postalCode: '',
        deliveryInstructions: '',
        courierPreference: '',
        isDefault: false
      });
      setSelectedAddress(null);
      setDeliveryZone(null);

    } catch (error) {
      console.error('Error saving address:', error);
      toast({
        title: "Error",
        description: "Failed to save address",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      setLoading(true);
      await userApiService.deleteAddress(addressId);
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      toast({
        title: "Success",
        description: "Address deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting address:', error);
      toast({
        title: "Error",
        description: "Failed to delete address",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      setLoading(true);
      await userApiService.setDefaultAddress(addressId);
      setAddresses(prev => prev.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      })));
      toast({
        title: "Success",
        description: "Default address updated",
      });
    } catch (error) {
      console.error('Error setting default address:', error);
      toast({
        title: "Error",
        description: "Failed to update default address",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditAddress = (address: Address) => {
    setSelectedAddress(address);
    setFormData(address);
    setIsEditModalOpen(true);
    if (address.postalCode) {
      checkDeliveryZone(address.postalCode);
    }
  };

  const handleDivisionChange = (divisionId: string) => {
    setFormData(prev => ({
      ...prev,
      division: divisionId,
      district: '',
      upazila: '',
      postalCode: ''
    }));
  };

  const handleDistrictChange = (districtId: string) => {
    setFormData(prev => ({
      ...prev,
      district: districtId,
      upazila: '',
      postalCode: ''
    }));
  };

  const handleUpazilaChange = (upazilaId: string) => {
    setFormData(prev => ({
      ...prev,
      upazila: upazilaId,
      postalCode: ''
    }));
  };

  const handlePostalCodeChange = (postalCode: string) => {
    setFormData(prev => ({ ...prev, postalCode }));
    if (postalCode.length >= 4) {
      checkDeliveryZone(postalCode);
    }
  };

  const getAddressTypeIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home className="h-4 w-4" />;
      case 'office': return <Building className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  };

  const getDeliveryZoneColor = (zone: string) => {
    switch (zone) {
      case 'express': return 'bg-green-100 text-green-800';
      case 'standard': return 'bg-blue-100 text-blue-800';
      case 'remote': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedDivision = bangladeshLocations?.divisions.find(d => d.id === formData.division);
  const selectedDistrict = selectedDivision?.districts.find(d => d.id === formData.district);
  const selectedUpazila = selectedDistrict?.upazilas.find(u => u.id === formData.upazila);

  const AddressForm = () => (
    <div className="space-y-6">
      {/* Address Type and Basic Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="type">Address Type</Label>
          <Select 
            value={formData.type} 
            onValueChange={(value: 'home' | 'office' | 'other') => 
              setFormData(prev => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select address type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="home">Home</SelectItem>
              <SelectItem value="office">Office</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="name">Contact Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Full name"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="+880 1X-XXXX-XXXX"
          required
        />
      </div>

      {/* Address Lines */}
      <div>
        <Label htmlFor="addressLine1">Address Line 1 *</Label>
        <Input
          id="addressLine1"
          value={formData.addressLine1}
          onChange={(e) => setFormData(prev => ({ ...prev, addressLine1: e.target.value }))}
          placeholder="House/Flat number, Road name"
          required
        />
      </div>

      <div>
        <Label htmlFor="addressLine2">Address Line 2</Label>
        <Input
          id="addressLine2"
          value={formData.addressLine2}
          onChange={(e) => setFormData(prev => ({ ...prev, addressLine2: e.target.value }))}
          placeholder="Area, Block, Sector (optional)"
        />
      </div>

      <div>
        <Label htmlFor="landmark">Landmark</Label>
        <Input
          id="landmark"
          value={formData.landmark}
          onChange={(e) => setFormData(prev => ({ ...prev, landmark: e.target.value }))}
          placeholder="Nearby landmark (optional)"
        />
      </div>

      {/* Bangladesh Geographic Selection */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="division">Division *</Label>
          <Select value={formData.division} onValueChange={handleDivisionChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select division" />
            </SelectTrigger>
            <SelectContent>
              {bangladeshLocations?.divisions.map((division) => (
                <SelectItem key={division.id} value={division.id}>
                  {division.name} ({division.nameBn})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="district">District *</Label>
          <Select value={formData.district} onValueChange={handleDistrictChange} disabled={!formData.division}>
            <SelectTrigger>
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent>
              {selectedDivision?.districts.map((district) => (
                <SelectItem key={district.id} value={district.id}>
                  {district.name} ({district.nameBn})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="upazila">Upazila/Thana *</Label>
          <Select value={formData.upazila} onValueChange={handleUpazilaChange} disabled={!formData.district}>
            <SelectTrigger>
              <SelectValue placeholder="Select upazila" />
            </SelectTrigger>
            <SelectContent>
              {selectedDistrict?.upazilas.map((upazila) => (
                <SelectItem key={upazila.id} value={upazila.id}>
                  {upazila.name} ({upazila.nameBn})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="postalCode">Postal Code *</Label>
          <Select value={formData.postalCode} onValueChange={handlePostalCodeChange} disabled={!formData.upazila}>
            <SelectTrigger>
              <SelectValue placeholder="Select postal code" />
            </SelectTrigger>
            <SelectContent>
              {selectedUpazila?.postalCodes.map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Delivery Zone Information */}
      {deliveryZone && (
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Delivery Information</h4>
                <p className="text-sm text-gray-600">
                  Zone: <Badge className={getDeliveryZoneColor(deliveryZone.zone)}>
                    {deliveryZone.zone.toUpperCase()}
                  </Badge>
                </p>
                <p className="text-sm text-gray-600">
                  Estimated delivery: {deliveryZone.estimatedDays}
                </p>
                {deliveryZone.additionalCharge > 0 && (
                  <p className="text-sm text-orange-600">
                    Additional charge: ৳{deliveryZone.additionalCharge}
                  </p>
                )}
              </div>
              <Truck className="h-8 w-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                Available couriers: {deliveryZone.courierServices.join(', ')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Preferences */}
      <div>
        <Label htmlFor="courierPreference">Preferred Courier</Label>
        <Select 
          value={formData.courierPreference} 
          onValueChange={(value) => setFormData(prev => ({ ...prev, courierPreference: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select preferred courier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pathao">Pathao</SelectItem>
            <SelectItem value="paperfly">Paperfly</SelectItem>
            <SelectItem value="sundarban">Sundarban</SelectItem>
            <SelectItem value="redx">RedX</SelectItem>
            <SelectItem value="ecourier">eCourier</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="deliveryInstructions">Delivery Instructions</Label>
        <Textarea
          id="deliveryInstructions"
          value={formData.deliveryInstructions}
          onChange={(e) => setFormData(prev => ({ ...prev, deliveryInstructions: e.target.value }))}
          placeholder="Special delivery instructions (optional)"
          rows={3}
        />
      </div>

      {/* Set as Default */}
      <div className="flex items-center space-x-2">
        <Switch
          id="isDefault"
          checked={formData.isDefault}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isDefault: checked }))}
        />
        <Label htmlFor="isDefault">Set as default address</Label>
      </div>
    </div>
  );

  if (loading && addresses.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Address Book</h1>
          <p className="text-gray-600">Manage your delivery addresses</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Address
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Address</DialogTitle>
              <DialogDescription>
                Add a new delivery address with Bangladesh location details
              </DialogDescription>
            </DialogHeader>
            <AddressForm />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveAddress} disabled={loading}>
                {loading ? 'Saving...' : 'Save Address'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Addresses List */}
      <div className="grid gap-4">
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No addresses found</h3>
              <p className="text-gray-600 mb-4">Add your first delivery address to get started</p>
              <Button onClick={() => setIsAddModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          addresses.map((address) => (
            <Card 
              key={address.id} 
              className={`${address.isDefault ? 'ring-2 ring-blue-500' : ''} ${
                selectionMode ? 'cursor-pointer hover:bg-gray-50' : ''
              }`}
              onClick={() => selectionMode && onAddressSelect?.(address)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getAddressTypeIcon(address.type)}
                      <span className="font-medium capitalize">{address.type}</span>
                      {address.isDefault && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Star className="h-3 w-3 mr-1" />
                          Default
                        </Badge>
                      )}
                      {address.verified && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      <p className="font-medium">{address.name}</p>
                      <p className="text-sm text-gray-600">
                        <Phone className="h-3 w-3 inline mr-1" />
                        {address.phone}
                      </p>
                      <p className="text-sm text-gray-700">
                        {address.addressLine1}
                        {address.addressLine2 && `, ${address.addressLine2}`}
                        {address.landmark && `, ${address.landmark}`}
                      </p>
                      <p className="text-sm text-gray-600">
                        <FaFlag className="h-3 w-3 inline mr-1" />
                        {address.upazila}, {address.district}, {address.division} - {address.postalCode}
                      </p>
                      
                      {address.deliveryInstructions && (
                        <p className="text-xs text-gray-500 mt-2">
                          <Navigation className="h-3 w-3 inline mr-1" />
                          {address.deliveryInstructions}
                        </p>
                      )}

                      {address.courierPreference && (
                        <p className="text-xs text-gray-500">
                          <Truck className="h-3 w-3 inline mr-1" />
                          Preferred: {address.courierPreference}
                        </p>
                      )}
                    </div>
                  </div>

                  {!selectionMode && (
                    <div className="flex items-center space-x-2 ml-4">
                      {!address.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSetDefault(address.id)}
                          disabled={loading}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditAddress(address)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Address</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this address? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteAddress(address.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Address Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Address</DialogTitle>
            <DialogDescription>
              Update your delivery address information
            </DialogDescription>
          </DialogHeader>
          <AddressForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditModalOpen(false);
              setSelectedAddress(null);
              setFormData({
                type: 'home',
                name: '',
                phone: '',
                addressLine1: '',
                addressLine2: '',
                landmark: '',
                division: '',
                district: '',
                upazila: '',
                postalCode: '',
                deliveryInstructions: '',
                courierPreference: '',
                isDefault: false
              });
            }}>
              Cancel
            </Button>
            <Button onClick={handleSaveAddress} disabled={loading}>
              {loading ? 'Updating...' : 'Update Address'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddressBook;