'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef } from '@tanstack/react-table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  ArrowUpDown,
  Plus,
  Edit,
  Trash2,
  FileImage,
  Eye,
  CheckSquare,
} from 'lucide-react'
import { CustomDataTable } from '@/components/CustomDataTable'

// 50개의 목업 데이터 (고정된 데이터로 Hydration 에러 방지)
const MOCK_DATA: User[] = [
  {
    id: 'user_1',
    loginId: '101234',
    name: '김민수',
    role: 'ADMIN',
    licensePhoto: 'license_1.jpg',
  },
  {
    id: 'user_2',
    loginId: '102567',
    name: '이영희',
    role: 'ADMIN',
    licensePhoto: null,
  },
  {
    id: 'user_3',
    loginId: '103890',
    name: '박철수',
    role: 'ADMIN',
    licensePhoto: 'license_3.jpg',
  },
  {
    id: 'user_4',
    loginId: '104123',
    name: '정수현',
    role: 'ADMIN',
    licensePhoto: null,
  },
  {
    id: 'user_5',
    loginId: '105456',
    name: '최영진',
    role: 'ADMIN',
    licensePhoto: 'license_5.jpg',
  },
  {
    id: 'user_6',
    loginId: '106789',
    name: '한미영',
    role: 'ADMIN',
    licensePhoto: null,
  },
  {
    id: 'user_7',
    loginId: '107012',
    name: '오준호',
    role: 'ADMIN',
    licensePhoto: 'license_7.jpg',
  },
  {
    id: 'user_8',
    loginId: '108345',
    name: '장서연',
    role: 'WORKER',
    licensePhoto: null,
  },
  {
    id: 'user_9',
    loginId: '109678',
    name: '윤대현',
    role: 'WORKER',
    licensePhoto: 'license_9.jpg',
  },
  {
    id: 'user_10',
    loginId: '110901',
    name: '강지현',
    role: 'WORKER',
    licensePhoto: null,
  },
  {
    id: 'user_11',
    loginId: '111234',
    name: '임재원',
    role: 'WORKER',
    licensePhoto: 'license_11.jpg',
  },
  {
    id: 'user_12',
    loginId: '112567',
    name: '송미라',
    role: 'WORKER',
    licensePhoto: null,
  },
  {
    id: 'user_13',
    loginId: '113890',
    name: '홍길동',
    role: 'WORKER',
    licensePhoto: 'license_13.jpg',
  },
  {
    id: 'user_14',
    loginId: '114123',
    name: '조현우',
    role: 'WORKER',
    licensePhoto: null,
  },
  {
    id: 'user_15',
    loginId: '115456',
    name: '신지영',
    role: 'WORKER',
    licensePhoto: 'license_15.jpg',
  },
  {
    id: 'user_16',
    loginId: '116789',
    name: '배성호',
    role: 'WORKER',
    licensePhoto: null,
  },
  {
    id: 'user_17',
    loginId: '117012',
    name: '류민정',
    role: 'WORKER',
    licensePhoto: 'license_17.jpg',
  },
  {
    id: 'user_18',
    loginId: '118345',
    name: '노태준',
    role: 'WORKER',
    licensePhoto: null,
  },
  {
    id: 'user_19',
    loginId: '119678',
    name: '문혜진',
    role: 'WORKER',
    licensePhoto: 'license_19.jpg',
  },
  {
    id: 'user_20',
    loginId: '120901',
    name: '서동혁',
    role: 'WORKER',
    licensePhoto: null,
  },
  {
    id: 'user_21',
    loginId: '121234',
    name: '황지우',
    role: 'WORKER',
    licensePhoto: 'license_21.jpg',
  },
  {
    id: 'user_22',
    loginId: '122567',
    name: '권민아',
    role: 'WORKER',
    licensePhoto: null,
  },
  {
    id: 'user_23',
    loginId: '123890',
    name: '안성민',
    role: 'WORKER',
    licensePhoto: 'license_23.jpg',
  },
  {
    id: 'user_24',
    loginId: '124123',
    name: '유정현',
    role: 'WORKER',
    licensePhoto: null,
  },
  {
    id: 'user_25',
    loginId: '125456',
    name: '전현수',
    role: 'WORKER',
    licensePhoto: 'license_25.jpg',
  },
  {
    id: 'user_26',
    loginId: '126789',
    name: '고은비',
    role: 'WORKER',
    licensePhoto: null,
  },
  {
    id: 'user_27',
    loginId: '127012',
    name: '남주현',
    role: 'WORKER',
    licensePhoto: 'license_27.jpg',
  },
  {
    id: 'user_28',
    loginId: '128345',
    name: '손태영',
    role: 'WORKER',
    licensePhoto: null,
  },
  {
    id: 'user_29',
    loginId: '129678',
    name: '백지원',
    role: 'WORKER',
    licensePhoto: 'license_29.jpg',
  },
  {
    id: 'user_30',
    loginId: '130901',
    name: '원석진',
    role: 'WORKER',
    licensePhoto: null,
  },
  {
    id: 'user_31',
    loginId: '131234',
    name: '구민지',
    role: 'WORKER',
    licensePhoto: 'license_31.jpg',
  },
  {
    id: 'user_32',
    loginId: '132567',
    name: '변준서',
    role: 'WORKER',
    licensePhoto: null,
  },
  {
    id: 'user_33',
    loginId: '133890',
    name: '표혜성',
    role: 'WORKER',
    licensePhoto: 'license_33.jpg',
  },
  {
    id: 'user_34',
    loginId: '134123',
    name: '도현준',
    role: 'WORKER',
    licensePhoto: null,
  },
  {
    id: 'user_35',
    loginId: '135456',
    name: '소유진',
    role: 'WORKER',
    licensePhoto: 'license_35.jpg',
  },
  {
    id: 'user_36',
    loginId: '136789',
    name: '라지훈',
    role: 'WORKER',
    licensePhoto: null,
  },
  {
    id: 'user_37',
    loginId: '137012',
    name: '마서현',
    role: 'WORKER',
    licensePhoto: 'license_37.jpg',
  },
  {
    id: 'user_38',
    loginId: '138345',
    name: '석민우',
    role: 'WORKER',
    licensePhoto: null,
  },
  {
    id: 'user_39',
    loginId: '139678',
    name: '방지은',
    role: 'WORKER',
    licensePhoto: 'license_39.jpg',
  },
  {
    id: 'user_40',
    loginId: '140901',
    name: '추성락',
    role: 'WORKER',
    licensePhoto: null,
  },
  {
    id: 'user_41',
    loginId: '141234',
    name: '탁현정',
    role: 'WORKER',
    licensePhoto: 'license_41.jpg',
  },
  {
    id: 'user_42',
    loginId: '142567',
    name: '감동현',
    role: 'WORKER',
    licensePhoto: null,
  },
  {
    id: 'user_43',
    loginId: '143890',
    name: '설지혜',
    role: 'WORKER',
    licensePhoto: 'license_43.jpg',
  },
  {
    id: 'user_44',
    loginId: '144123',
    name: '편성호',
    role: 'WORKER',
    licensePhoto: null,
  },
  {
    id: 'user_45',
    loginId: '145456',
    name: '후민정',
    role: 'WORKER',
    licensePhoto: 'license_45.jpg',
  },
  {
    id: 'user_46',
    loginId: '146789',
    name: '천준영',
    role: 'WORKER',
    licensePhoto: null,
  },
  {
    id: 'user_47',
    loginId: '147012',
    name: '공서진',
    role: 'WORKER',
    licensePhoto: 'license_47.jpg',
  },
  {
    id: 'user_48',
    loginId: '148345',
    name: '견태호',
    role: 'WORKER',
    licensePhoto: null,
  },
  {
    id: 'user_49',
    loginId: '149678',
    name: '개지현',
    role: 'WORKER',
    licensePhoto: 'license_49.jpg',
  },
  {
    id: 'user_50',
    loginId: '150901',
    name: '복민수',
    role: 'WORKER',
    licensePhoto: null,
  },
]

export type User = {
  id: string
  loginId: string
  name: string
  role: 'ADMIN' | 'WORKER'
  licensePhoto: null | string
}

export const columns: ColumnDef<User>[] = [
  // {
  //   id: 'select',
  //   header: ({ table }) => (
  //     <div className="flex justify-center">
  //       <Checkbox
  //         checked={
  //           table.getIsAllPageRowsSelected() ||
  //           (table.getIsSomePageRowsSelected() && 'indeterminate')
  //         }
  //         onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
  //         aria-label="Select all"
  //         className="border-gray-300"
  //       />
  //     </div>
  //   ),
  //   cell: ({ row }) => (
  //     <div className="flex justify-center">
  //       <Checkbox
  //         checked={row.getIsSelected()}
  //         onCheckedChange={value => row.toggleSelected(!!value)}
  //         aria-label="Select row"
  //         className="border-gray-300"
  //       />
  //     </div>
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: 'loginId',
    header: ({ column }) => {
      return (
        <div className="text-center font-semibold text-gray-700">사번</div>
        // <div className="flex justify-center">
        //   <Button
        //     variant="ghost"
        //     onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        //     className="h-8 px-2 font-semibold text-gray-700 hover:bg-gray-100"
        //   >
        //     사번
        //     <ArrowUpDown className="ml-2 h-4 w-4" />
        //   </Button>
        // </div>
      )
    },
    cell: ({ row }) => (
      <div className="text-center font-mono text-sm font-medium text-gray-900">
        {row.getValue('loginId')}
      </div>
    ),
  },
  {
    accessorKey: 'name',
    header: () => (
      <div className="text-center font-semibold text-gray-700">이름</div>
    ),
    cell: ({ row }) => (
      <div className="text-center font-medium text-gray-900">
        {row.getValue('name')}
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: () => (
      <div className="text-center font-semibold text-gray-700">역할</div>
    ),
    cell: ({ row }) => {
      const role = row.getValue('role') as 'ADMIN' | 'WORKER'
      const roleText = role === 'ADMIN' ? '관리자' : '작업자'

      return (
        <div className="flex justify-center">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              role === 'ADMIN'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-green-100 text-green-800 border border-green-200'
            }`}
          >
            {roleText}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'licensePhoto',
    header: () => (
      <div className="text-center font-semibold text-gray-700">공정면허증</div>
    ),
    cell: ({ row }) => {
      const isLicensePhoto = row.getValue('licensePhoto')

      return (
        <div className="text-center">
          {isLicensePhoto ? (
            <Button
              variant="default"
              size="sm"
              onClick={e => {
                e.stopPropagation()
                alert('업로드 된 이미지')
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm"
            >
              <FileImage className="w-3 h-3 mr-1" />
              확인
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={e => {
                e.stopPropagation()
                alert('이미지 선택하기')
              }}
              className="border-gray-300 text-gray-600 hover:bg-gray-50 px-3 py-1 text-sm"
            >
              <Plus className="w-3 h-3 mr-1" />
              등록
            </Button>
          )}
        </div>
      )
    },
  },
]

/**
 * 사용자 목록 화면
 **/
const UsersTable = () => {
  const router = useRouter()

  // 관리자를 상단에 표시하기 위한 데이터 정렬
  const sortedData = React.useMemo(() => {
    return [...MOCK_DATA].sort((a, b) => {
      if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1
      if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1
      return 0
    })
  }, [MOCK_DATA])

  // 행 클릭 시 상세보기 페이지로 이동
  const handleRowClick = (user: User) => {
    router.push(`/admin/dashboard/user/${user.id}`)
  }

  return (
    <div className="space-y-6">
      {/* 헤더 영역 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              전체 직원 목록
            </h2>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              등록된 직원들을 관리하고 새로운 직원을 추가할 수 있습니다.
            </p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="whitespace-nowrap">
                관리자: {MOCK_DATA.filter(user => user.role === 'ADMIN').length}
                명
              </span>
              <span className="whitespace-nowrap">
                작업자:{' '}
                {MOCK_DATA.filter(user => user.role === 'WORKER').length}명
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="default"
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2.5 font-medium shadow-sm text-sm md:text-base"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              신규 등록
            </Button>
          </div>
        </div>
      </div>

      {/* 테이블 영역 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <CustomDataTable
          data={sortedData}
          columns={columns}
          onRowClick={handleRowClick}
        />
      </div>
    </div>
  )
}

export default UsersTable
