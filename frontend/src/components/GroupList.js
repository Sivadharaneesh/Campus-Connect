import React, { useState, useEffect } from 'react';
import './GroupList.css';

const GroupList = ({ groups, selectedGroup, onSelectGroup }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [groupList, setGroupList] = useState([]);

  useEffect(() => {
    // Ensure groups is always an array
    if (Array.isArray(groups)) {
      setGroupList(groups);
    } else if (groups && typeof groups === 'object') {
      if (groups.data && Array.isArray(groups.data)) {
        setGroupList(groups.data);
      } else if (groups.groups && Array.isArray(groups.groups)) {
        setGroupList(groups.groups);
      } else {
        setGroupList(Object.values(groups));
      }
    } else {
      setGroupList([]);
    }
  }, [groups]);

  const joinGroup = async (group, callback) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/groups/${group._id}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        // Joined successfully → directly open chat
        callback(group);
      } else {
        const responseData = await response.json();
        console.error('Failed to join group:', responseData.message);
        // Still open the group so user can chat
        callback(group);
      }
    } catch (error) {
      console.error('Error joining group:', error);
      // Still open the group even if error
      callback(group);
    }
  };

  const filteredGroups = groupList.filter(group =>
    (group.name && group.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="group-list">
      <h2>Groups</h2>
      <input
        type="text"
        placeholder="Search groups..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="group-search"
      />
      <div className="groups">
        {filteredGroups.length === 0 ? (
          <p>No groups available</p>
        ) : (
          filteredGroups.map(group => (
            <div 
              key={group._id} 
              className={`group-item ${selectedGroup?._id === group._id ? 'selected' : ''}`}
              onClick={() => joinGroup(group, onSelectGroup)}
            >
              <h3>{group.name}</h3>
              <p>{group.description}</p>
              <span className="group-category">{group.category}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GroupList;
