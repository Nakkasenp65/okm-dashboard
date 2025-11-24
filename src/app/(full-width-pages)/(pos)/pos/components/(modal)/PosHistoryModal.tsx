import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { usePosHistory } from '../../hooks/usePosHistory';
import PosHistoryList from '../(pos-history)/PosHistoryList';
import PosHistoryDetails from '../(pos-history)/PosHistoryDetails';
import { PosHistoryItem, StaffMember } from '../../types/Pos';
import { FaUser, FaChevronDown } from 'react-icons/fa';

interface PosHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrint: (item: PosHistoryItem) => void;
  onEdit: (item: PosHistoryItem) => void;
  onDelete: (item: PosHistoryItem) => void;
  employeeId: string;
  allStaff: StaffMember[];
}

export default function PosHistoryModal({ isOpen, onClose, onPrint, onEdit, onDelete, employeeId, allStaff }: PosHistoryModalProps) {
  const { history, pagination, isLoading, fetchHistory } = usePosHistory();
  const [selectedItem, setSelectedItem] = useState<PosHistoryItem | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);

  // Initialize selected staff based on employeeId
  useEffect(() => {
    const staff = allStaff.find(s => s.staffId === employeeId || s.adminId === employeeId);
    if (staff) {
      setSelectedStaff(staff);
    }
  }, [employeeId, allStaff]);

  useEffect(() => {
    if (isOpen && selectedStaff) {
      fetchHistory(1, 10, selectedStaff.staffId || selectedStaff.adminId);
    }
  }, [isOpen, selectedStaff, fetchHistory]);

  const handlePageChange = (newPage: number) => {
    if (selectedStaff) {
      fetchHistory(newPage, 10, selectedStaff.staffId || selectedStaff.adminId);
    }
  };

  const handleViewDetails = (item: PosHistoryItem) => {
    setSelectedItem(item);
  };

  const handleBackToList = () => {
    setSelectedItem(null);
  };

  const handlePrint = (item: PosHistoryItem) => {
    onPrint(item);
  };

  const handleStaffSelect = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsStaffDropdownOpen(false);
    setSelectedItem(null); // Reset details view when changing staff
  };

  return (
    <Modal isOpen={isOpen} showCloseButton={false} onClose={onClose} isFullscreen={true}>
      <div className="flex h-screen w-screen flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black">
        {/* Enhanced Header */}
        <div className="z-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 shadow-lg">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">ประวัติการขาย</h3>
                  <p className="text-sm text-white/80">Sales Transaction History</p>
                </div>
              </div>
              
              {/* Staff Selector */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button
                    onClick={() => setIsStaffDropdownOpen(!isStaffDropdownOpen)}
                    className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm px-4 py-2.5 text-white transition-all hover:bg-white/20 border border-white/20"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 overflow-hidden">
                      {selectedStaff?.profile_image ? (
                        <img src={selectedStaff.profile_image} alt={selectedStaff.fullName} className="h-full w-full object-cover" />
                      ) : (
                        <FaUser className="text-sm" />
                      )}
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-white/70">พนักงาน</div>
                      <div className="font-semibold">{selectedStaff?.fullName || 'เลือกพนักงาน'}</div>
                    </div>
                    <FaChevronDown className={`text-xs transition-transform ${isStaffDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Staff Dropdown */}
                  {isStaffDropdownOpen && (
                    <div className="absolute top-full right-0 z-50 mt-2 w-72 rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800">
                      <div className="p-2">
                        <div className="mb-2 px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                          เลือกดูประวัติของพนักงาน
                        </div>
                        <div className="max-h-80 space-y-1 overflow-y-auto">
                          {allStaff.map((staff) => (
                            <button
                              key={staff.adminId}
                              onClick={() => handleStaffSelect(staff)}
                              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                                selectedStaff?.adminId === staff.adminId
                                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
                                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                              }`}
                            >
                              <div className={`flex h-10 w-10 items-center justify-center rounded-full overflow-hidden ${
                                selectedStaff?.adminId === staff.adminId
                                  ? 'bg-indigo-500'
                                  : 'bg-gray-200 dark:bg-gray-700'
                              }`}>
                                {staff.profile_image ? (
                                  <img src={staff.profile_image} alt={staff.fullName} className="h-full w-full object-cover" />
                                ) : (
                                  <FaUser className="text-sm text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{staff.fullName}</div>
                                <div className="text-xs opacity-60">รหัส: {staff.staffId || staff.adminId}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={onClose}
                  className="rounded-xl bg-white/10 p-2.5 backdrop-blur-sm transition-all hover:bg-white/20 border border-white/20"
                >
                  <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area with improved styling */}
        <div className="relative flex-1 overflow-hidden">
          {/* List View */}
          <div className={`absolute inset-0 transition-transform duration-300 ${selectedItem ? '-translate-x-full' : 'translate-x-0'}`}>
            <div className="h-full p-6">
              <div className="h-full rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
                <PosHistoryList
                  history={history}
                  pagination={pagination}
                  isLoading={isLoading}
                  onPageChange={handlePageChange}
                  onViewDetails={handleViewDetails}
                />
              </div>
            </div>
          </div>

          {/* Details View (Slide in) */}
          <div className={`absolute inset-0 transform transition-transform duration-300 ${selectedItem ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="h-full p-6">
              <div className="h-full rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
                {selectedItem && (
                  <PosHistoryDetails
                    item={selectedItem}
                    onBack={handleBackToList}
                    onPrint={() => handlePrint(selectedItem)}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
