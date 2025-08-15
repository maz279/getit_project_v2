/**
 * WishlistSharing - Social Sharing Component
 * Amazon.com/Shopee.sg-Level Wishlist Social Sharing
 * Phase 1 Week 3-4 Implementation
 */

import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Facebook, 
  Twitter, 
  Mail, 
  MessageCircle,
  Link,
  Users,
  Eye,
  EyeOff,
  CheckCircle,
  Gift,
  Heart
} from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Textarea } from '@/shared/ui/textarea';
import { Switch } from '@/shared/ui/switch';
import { Badge } from '@/shared/ui/badge';

interface WishlistSharingProps {
  wishlistId: string;
  wishlistName: string;
  itemCount: number;
  totalValue: number;
  isPublic: boolean;
  shareUrl: string;
  collaborators: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
    permissions: 'view' | 'edit';
  }>;
  onTogglePrivacy: (isPublic: boolean) => void;
  onAddCollaborator: (email: string, permissions: 'view' | 'edit') => void;
  onRemoveCollaborator: (collaboratorId: string) => void;
  onUpdatePermissions: (collaboratorId: string, permissions: 'view' | 'edit') => void;
  className?: string;
}

export const WishlistSharing: React.FC<WishlistSharingProps> = ({
  wishlistId,
  wishlistName,
  itemCount,
  totalValue,
  isPublic,
  shareUrl,
  collaborators,
  onTogglePrivacy,
  onAddCollaborator,
  onRemoveCollaborator,
  onUpdatePermissions,
  className = ''
}) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const [newCollaboratorEmail, setNewCollaboratorEmail] = useState('');
  const [newCollaboratorPermissions, setNewCollaboratorPermissions] = useState<'view' | 'edit'>('view');
  const [personalMessage, setPersonalMessage] = useState('');

  const formatPrice = (price: number) => {
    return `৳${price.toLocaleString()}`;
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleSocialShare = (platform: string) => {
    const text = `Check out my wishlist "${wishlistName}" with ${itemCount} amazing items worth ${formatPrice(totalValue)}!`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    let shareLink = '';
    
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodeURIComponent(`Check out my wishlist: ${wishlistName}`)}&body=${encodedText}%0A%0A${encodedUrl}`;
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  const handleAddCollaborator = () => {
    if (newCollaboratorEmail && isValidEmail(newCollaboratorEmail)) {
      onAddCollaborator(newCollaboratorEmail, newCollaboratorPermissions);
      setNewCollaboratorEmail('');
    }
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <div className={`max-w-4xl mx-auto p-4 space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Share2 className="h-5 w-5 mr-2" />
            Share Your Wishlist
          </CardTitle>
          <p className="text-sm text-gray-600">
            Share "{wishlistName}" with friends and family, or collaborate on your shopping lists
          </p>
        </CardHeader>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {isPublic ? <Eye className="h-5 w-5 mr-2" /> : <EyeOff className="h-5 w-5 mr-2" />}
            Privacy Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Make wishlist public</Label>
              <p className="text-sm text-gray-600">
                Anyone with the link can view your wishlist
              </p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={onTogglePrivacy}
            />
          </div>
          
          {isPublic && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Your wishlist is now public
                </span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Anyone with the link can see your items, but they cannot make changes unless you add them as a collaborator.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Share Link */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Link className="h-5 w-5 mr-2" />
            Share Link
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1"
              />
              <Button onClick={handleCopyLink} variant="outline">
                {copySuccess ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            
            <div>
              <Label htmlFor="personalMessage" className="text-sm font-medium">
                Add a personal message (optional)
              </Label>
              <Textarea
                id="personalMessage"
                placeholder="Hey! Check out my wishlist for some gift ideas..."
                value={personalMessage}
                onChange={(e) => setPersonalMessage(e.target.value)}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Media Sharing */}
      <Card>
        <CardHeader>
          <CardTitle>Share on Social Media</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              onClick={() => handleSocialShare('facebook')}
              className="flex flex-col items-center space-y-2 h-auto py-4"
            >
              <Facebook className="h-6 w-6 text-blue-600" />
              <span className="text-sm">Facebook</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleSocialShare('twitter')}
              className="flex flex-col items-center space-y-2 h-auto py-4"
            >
              <Twitter className="h-6 w-6 text-blue-400" />
              <span className="text-sm">Twitter</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleSocialShare('whatsapp')}
              className="flex flex-col items-center space-y-2 h-auto py-4"
            >
              <MessageCircle className="h-6 w-6 text-green-600" />
              <span className="text-sm">WhatsApp</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleSocialShare('email')}
              className="flex flex-col items-center space-y-2 h-auto py-4"
            >
              <Mail className="h-6 w-6 text-gray-600" />
              <span className="text-sm">Email</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Collaborators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Collaborators ({collaborators.length})
          </CardTitle>
          <p className="text-sm text-gray-600">
            Invite others to view or edit your wishlist
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add New Collaborator */}
            <div className="flex space-x-2">
              <Input
                placeholder="Enter email address"
                value={newCollaboratorEmail}
                onChange={(e) => setNewCollaboratorEmail(e.target.value)}
                className="flex-1"
              />
              <select
                value={newCollaboratorPermissions}
                onChange={(e) => setNewCollaboratorPermissions(e.target.value as 'view' | 'edit')}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="view">View only</option>
                <option value="edit">Can edit</option>
              </select>
              <Button
                onClick={handleAddCollaborator}
                disabled={!newCollaboratorEmail || !isValidEmail(newCollaboratorEmail)}
              >
                Invite
              </Button>
            </div>

            {/* Existing Collaborators */}
            {collaborators.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Current Collaborators</h4>
                {collaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {collaborator.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{collaborator.name}</p>
                        <p className="text-sm text-gray-600">{collaborator.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={collaborator.permissions}
                        onChange={(e) => onUpdatePermissions(collaborator.id, e.target.value as 'view' | 'edit')}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="view">View only</option>
                        <option value="edit">Can edit</option>
                      </select>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRemoveCollaborator(collaborator.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Wishlist Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Gift className="h-5 w-5 mr-2" />
            Wishlist Preview
          </CardTitle>
          <p className="text-sm text-gray-600">
            This is how your wishlist will appear to others
          </p>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{wishlistName}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Heart className="h-4 w-4 mr-1 text-red-500" />
                    {itemCount} items
                  </span>
                  <span>Total value: {formatPrice(totalValue)}</span>
                  <Badge variant={isPublic ? 'default' : 'secondary'}>
                    {isPublic ? 'Public' : 'Private'}
                  </Badge>
                </div>
              </div>
            </div>
            
            {personalMessage && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <p className="text-sm text-blue-900">{personalMessage}</p>
              </div>
            )}
            
            <div className="text-sm text-gray-600">
              <p>• Viewers can see all items in your wishlist</p>
              <p>• They can get purchase suggestions and price alerts</p>
              <p>• Collaborators can add, remove, and organize items</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bangladesh-specific sharing options */}
      <Card>
        <CardHeader>
          <CardTitle>Bangladesh Special Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">Festival Sharing</h4>
              <p className="text-sm text-green-700 mb-3">
                Share your Eid, Pohela Boishakh, or wedding wishlists with family
              </p>
              <Button size="sm" variant="outline" className="text-green-700 border-green-300">
                Create Festival List
              </Button>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Mobile Banking Integration</h4>
              <p className="text-sm text-blue-700 mb-3">
                Enable bKash/Nagad gift contributions from friends and family
              </p>
              <Button size="sm" variant="outline" className="text-blue-700 border-blue-300">
                Enable Contributions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WishlistSharing;