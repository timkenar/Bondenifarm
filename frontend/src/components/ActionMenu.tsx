import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { MoreVertical, Edit2, Trash2 } from 'lucide-react';

interface ActionMenuProps {
    onEdit?: () => void;
    onDelete?: () => void;
}

const ActionMenu: React.FC<ActionMenuProps> = ({ onEdit, onDelete }) => {
    return (
        <Menu as="div" style={{ position: 'relative', display: 'inline-block', textAlign: 'left' }}>
            <div>
                <Menu.Button
                    className="btn"
                    style={{
                        padding: '0.5rem',
                        background: 'transparent',
                        color: 'var(--text-muted)',
                        border: 'none'
                    }}
                >
                    <MoreVertical size={18} />
                </Menu.Button>
            </div>
            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items style={{
                    position: 'absolute',
                    right: 0,
                    marginTop: '0.5rem',
                    width: '10rem',
                    transformOrigin: 'top right',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    boxShadow: 'var(--shadow)',
                    zIndex: 50,
                    outline: 'none',
                    padding: '0.25rem'
                }}>
                    {onEdit && (
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent bubbling if card is clickable
                                        onEdit();
                                    }}
                                    style={{
                                        display: 'flex',
                                        width: '100%',
                                        alignItems: 'center',
                                        padding: '0.5rem 0.75rem',
                                        fontSize: '0.875rem',
                                        color: active ? 'white' : 'var(--text-main)',
                                        backgroundColor: active ? 'var(--primary)' : 'transparent',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Edit2 size={16} />
                                    Edit
                                </button>
                            )}
                        </Menu.Item>
                    )}
                    {onDelete && (
                        <Menu.Item>
                            {({ active }) => (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete();
                                    }}
                                    style={{
                                        display: 'flex',
                                        width: '100%',
                                        alignItems: 'center',
                                        padding: '0.5rem 0.75rem',
                                        fontSize: '0.875rem',
                                        color: active ? 'white' : 'var(--danger)',
                                        backgroundColor: active ? 'var(--danger)' : 'transparent',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            )}
                        </Menu.Item>
                    )}
                </Menu.Items>
            </Transition>
        </Menu>
    );
};

export default ActionMenu;
