
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { mockSupabase } from '../services/supabase';
import { Card, Button, Badge, Modal, Input, Select } from '../components/common/UI';
import { ROOM_TYPES, ROOM_STATUSES, AMENITIES } from '../constants';
import { Room } from '../types';

export default function Rooms() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { data: rooms, isLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: mockSupabase.rooms.getAll
  });

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<Omit<Room, 'id' | 'images'>>({
    defaultValues: {
      roomname: '',
      roomtype: 'Single',
      price: 0,
      capacity: 1,
      status: 'Available',
      amenities: []
    }
  });

  const selectedAmenities = watch('amenities') || [];

  const addOrUpdateMutation = useMutation({
    mutationFn: async (data: any) => {
      let imageUrls = editingRoom?.images || [];
      if (selectedFiles.length > 0) {
        setUploadProgress(0);
        const newUrls = await mockSupabase.rooms.uploadImages(selectedFiles, (p) => setUploadProgress(p));
        imageUrls = [...imageUrls, ...newUrls];
      }

      const roomData = { ...data, images: imageUrls };
      if (editingRoom) {
        return mockSupabase.rooms.update(editingRoom.id, roomData);
      } else {
        return mockSupabase.rooms.create(roomData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      closeModal();
    },
    onSettled: () => setUploadProgress(null)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => mockSupabase.rooms.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setIsDeleteModalOpen(false);
    }
  });

  const openModal = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setValue('roomname', room.roomname);
      setValue('roomtype', room.roomtype);
      setValue('price', room.price);
      setValue('capacity', room.capacity);
      setValue('status', room.status);
      setValue('amenities', room.amenities);
      setPreviewImages(room.images);
    } else {
      setEditingRoom(null);
      reset();
      setPreviewImages([]);
    }
    setSelectedFiles([]);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRoom(null);
    reset();
    setPreviewImages([]);
    setSelectedFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Fix: Explicitly cast 'Array.from' output to 'File[]' to ensure 'f' is inferred correctly for URL.createObjectURL
    const files = Array.from(e.target.files || []) as File[];
    if (files.length + previewImages.length > 5) {
      alert("Maximum 5 images allowed");
      return;
    }
    setSelectedFiles(prev => [...prev, ...files]);
    const filePreviews = files.map(f => URL.createObjectURL(f));
    setPreviewImages(prev => [...prev, ...filePreviews]);
  };

  const removePreviewImage = (index: number) => {
    // This is simplified: in real app would handle removing specific file or stored URL
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const filteredRooms = useMemo(() => {
    if (!rooms) return [];
    return rooms.filter(room => {
      const matchesSearch = room.roomname.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            room.roomtype.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || room.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rooms, searchTerm, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-700';
      case 'Booked': return 'bg-red-100 text-red-700';
      case 'Maintenance': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark">Rooms Management</h1>
          <p className="text-gray-500">Add, edit, and organize your room inventory</p>
        </div>
        <Button onClick={() => openModal()} className="shadow-lg shadow-primary/20">
          <span className="text-xl">+</span> Add New Room
        </Button>
      </div>

      <Card className="flex flex-col md:flex-row gap-4 items-center bg-white border-none shadow-sm py-4">
        <div className="w-full md:flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <Input 
            placeholder="Search by room name or type..." 
            className="pl-12 bg-gray-50 border-none h-12" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <Select 
            options={['All', ...ROOM_STATUSES]} 
            className="bg-gray-50 border-none h-12" 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-2xl h-[400px] animate-pulse"></div>
          ))}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-200">
          <div className="text-6xl mb-4 opacity-20">🏨</div>
          <h3 className="text-xl font-bold text-gray-800">No rooms found</h3>
          <p className="text-gray-400 mt-2">Try adjusting your filters or search term.</p>
          <Button variant="ghost" className="mt-6" onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}>
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="p-0 border-none shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                <img 
                  src={room.images[0] || 'https://via.placeholder.com/400x300?text=No+Image'} 
                  alt={room.roomname} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <Badge color={getStatusColor(room.status)}>{room.status}</Badge>
                </div>
                <div className="absolute top-4 right-4 flex gap-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => openModal(room)} className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm hover:bg-white text-primary">✏️</button>
                  <button onClick={() => { setRoomToDelete(room); setIsDeleteModalOpen(true); }} className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm hover:bg-white text-red-500">🗑️</button>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                   <div className="bg-black/50 backdrop-blur px-3 py-1 rounded-full text-xs text-white">
                      {room.roomtype}
                   </div>
                   <div className="bg-white px-4 py-2 rounded-xl shadow-lg">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Per Night</p>
                      <p className="text-lg font-black text-dark">₹{room.price.toLocaleString()}</p>
                   </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-3">{room.roomname}</h3>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-50">
                   <span className="flex items-center gap-1">👤 {room.capacity} Guest{room.capacity > 1 ? 's' : ''}</span>
                   <span className="flex items-center gap-1">📏 {room.roomtype === 'Suite' ? '500' : '300'} sqft</span>
                </div>

                <div className="flex flex-wrap gap-2">
                   {room.amenities.slice(0, 4).map(amn => (
                     <span key={amn} className="text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-gray-400 px-2.5 py-1 rounded-md border border-gray-100">
                       {AMENITIES.find(a => a.label === amn)?.icon} {amn}
                     </span>
                   ))}
                   {room.amenities.length > 4 && (
                     <span className="text-[10px] font-bold text-primary px-2">+ {room.amenities.length - 4} More</span>
                   )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        title={editingRoom ? "Edit Room Details" : "Register New Room"}
      >
        <form onSubmit={handleSubmit((d) => addOrUpdateMutation.mutate(d))} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Input 
                label="Room Name" 
                placeholder="e.g. Ocean View Deluxe 402" 
                {...register('roomname', { required: 'Room name is required' })}
                error={errors.roomname?.message}
              />
            </div>
            <Select 
              label="Room Type" 
              options={ROOM_TYPES} 
              {...register('roomtype', { required: true })} 
            />
            <Input 
              label="Price (₹)" 
              type="number" 
              {...register('price', { required: true, min: 0 })} 
              error={errors.price?.message}
            />
            <Input 
              label="Capacity (Max Guests)" 
              type="number" 
              {...register('capacity', { required: true, min: 1, max: 10 })} 
              error={errors.capacity?.message}
            />
            <Select 
              label="Current Status" 
              options={ROOM_STATUSES} 
              {...register('status')} 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
              {AMENITIES.map(amn => (
                <label key={amn.id} className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    value={amn.label}
                    {...register('amenities', { validate: val => val.length > 0 || 'Select at least one amenity' })}
                    className="w-4 h-4 text-primary rounded border-gray-300"
                  />
                  <span className="text-xs text-gray-600 group-hover:text-dark transition-colors">{amn.icon} {amn.label}</span>
                </label>
              ))}
            </div>
            {errors.amenities && <p className="mt-1 text-xs text-red-500">{errors.amenities.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Photos (Up to 5)</label>
            <div className="flex flex-wrap gap-2 mb-3">
               {previewImages.map((src, i) => (
                 <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 shadow-sm group">
                    <img src={src} className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => removePreviewImage(i)}
                      className="absolute top-1 right-1 bg-white/80 rounded-full w-5 h-5 text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >✕</button>
                 </div>
               ))}
               {previewImages.length < 5 && (
                 <label className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all">
                    <span className="text-xl text-gray-400">+</span>
                    <span className="text-[10px] text-gray-400 font-bold">ADD</span>
                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                 </label>
               )}
            </div>
          </div>

          {uploadProgress !== null && (
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
               <div className="bg-primary h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="ghost" type="button" onClick={closeModal}>Discard</Button>
            <Button type="submit" isLoading={addOrUpdateMutation.isPending} className="px-8">
              {editingRoom ? "Save Changes" : "Create Room"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
      >
        <div className="text-center space-y-4">
           <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center text-3xl mx-auto">⚠️</div>
           <h3 className="text-xl font-bold">Delete {roomToDelete?.roomname}?</h3>
           <p className="text-gray-500">
             Are you sure you want to remove this room from the system? 
             {roomToDelete?.status === 'Booked' && (
               <span className="block mt-2 font-bold text-red-500">Warning: This room has an active booking!</span>
             )}
           </p>
           <div className="flex justify-center gap-3 pt-6">
              <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>No, Cancel</Button>
              <Button variant="danger" onClick={() => deleteMutation.mutate(roomToDelete!.id)} isLoading={deleteMutation.isPending}>
                Yes, Delete Room
              </Button>
           </div>
        </div>
      </Modal>
    </div>
  );
}
