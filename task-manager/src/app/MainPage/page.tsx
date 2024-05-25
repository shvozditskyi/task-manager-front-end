"use client"
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

type Board = {
  id: number;
  name: string;
  description: string | null;
  isOwner: boolean;
  isDefault: boolean;
  email: string;
};
  
  const mainPage: React.FC = () => {
    const [boards, setBoards] = useState<Board[]>([]);
    const [newBoardName, setNewBoardName] = useState('');
    const [dropdownVisible, setDropdownVisible] = useState<{ [key: number]: boolean }>({});
    const dropdownRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

    // HTTP GET to fetch the boards
    const fetchBoards = async () => {
      try {
        const token = sessionStorage.getItem('accessToken');
        const response = await fetch('http://localhost:8080/api/boards', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch boards');
        } else {
        const data = await response.json();
        // console.log("Data: ",data);
        const boardsData = data.map((item: any) => ({
          ...item.board,
          email: item.board.participants?.[0].email || "no email"
        }));
        console.log("boards data: ",boardsData);
        
        setBoards(boardsData);
        
        }
      } catch (error) {
        console.error('Error fetching boards:', error);
      }
    };

    useEffect(() => {
      fetchBoards();
    }, []); // initial render

    // HTTP POST to create a new board
    // https://httpbin.org/post
    // http://localhost:8080/api/boards
    const handleCreateBoard = async () => {
      if (newBoardName.length > 0) {
      try {
        // console.log("name test:", newBoardName)
        const token = sessionStorage.getItem('accessToken');
        const response = await fetch('http://localhost:8080/api/boards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `${token}`,
          },
          body: JSON.stringify({ 
            name: newBoardName
          }), // only name is required
        });
        let errorElement = document.querySelector(".error")!;
        errorElement.innerHTML = ""
        if (!response.ok) {
          throw new Error('Failed to create board');
        } else {
        fetchBoards();
        setNewBoardName('');
        }
      } catch (error) {
        console.error('Error creating board:', error);
      }
    } else { //error message
      let errorElement = document.querySelector(".error")!;
      errorElement.innerHTML = "Board needs to be at least 1 character long"
    }
    
    };

    // HTTP DELETE to remove a board
  const handleDeleteBoard = async (id: number) => {
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await fetch(`http://localhost:8080/api/boards/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to delete board');
      }
      setBoards(prevBoards => prevBoards.filter(board => board.id !== id));
    } catch (error) {
      console.error('Error deleting board:', error);
    }
  };

  // Toggle visibility
  const toggleDropdown = (id: number) => {
    setDropdownVisible(prevState => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  // Hide dropdowns
  const hideDropdowns = () => {
    setDropdownVisible({});
  };

  // Handle click outside dropdown and ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (Object.values(dropdownRefs.current).some(ref => ref && ref.contains(target))) {
        return;
      }
      hideDropdowns();
    };

    const handleEscKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hideDropdowns();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKeyPress);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKeyPress);
    };
  }, []);

  return (
    <div>
      <h1 className="main-title font-bold mt-20 flex justify-center">Choose a board</h1>
      <p className="error text-center"></p>
      
      <div className="flex flex-row justify-center items-center">
        <Link href={"/BoardPage"} className='d-border'>Go to Default Board Page</Link>
        <input
          type="text"
          value={newBoardName}
          onChange={(e) => setNewBoardName(e.target.value)}
          onKeyUp={(e) => {
            if (e.key === 'Enter') {
              handleCreateBoard();
            }
          }}
          placeholder="Enter board name..."
          className="input px-2 py-1 ml-4"
        />
        <button onClick={handleCreateBoard} className="button ml-2">Create Board</button>
      </div>
      <div className='board-items'>
        <ul className='grid grid-cols-4 justify-items-center m-2'>
          {boards.length > 0 ? (
            boards.map((board, index) => (
              <li key={index} className="item-border mb-2 hover:bg-green-300 m-2 relative z-10">
              <div className='grid grid-cols-4'>
                <Link href={`/MainPage/${board.id}`} className='col-span-3'>
                  <p className='text-pretty break-words'>{board.name}</p>
                </Link>
                <div className='relative col-span-1 '>
                  <button
                    className='board-menu cursor-pointer '
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the Link
                      toggleDropdown(board.id);
                    }}
                  >
                    <img src={"/more.png"} alt="More Options" className="h-6 w-6 p-1 hover:bg-green-400 rounded" />
                  </button>
                  {dropdownVisible[board.id] && (
                    <div ref={el => (dropdownRefs.current[board.id] = el)} className='dropdown-menu absolute right-0 top-8 bg-white border border-gray-300 rounded shadow-lg z-100'>
                      <button
                        className='block px-4 py-2 text-left w-full hover:bg-gray-200'
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the Link
                          handleDeleteBoard(board.id);
                          hideDropdowns();
                        }}
                      >Delete Board
                      </button>
                      <button
                        className='block px-4 py-2 text-left w-full hover:bg-gray-200'
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the Link
                          hideDropdowns();
                        }}
                      >Rename Board (WIP)
                      </button>
                    </div>
                  )}  
                  <p id='email' className='py-2 -ml-4 text-xs truncate  sm:text-clip'>{board.email}</p>
                </div>
              </div>
              </li>
            ))
          ) : (
            <li className='col-span-3'>No boards available</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default mainPage