<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Create Departments
        $departments = [
            ['name' => 'Engineering',      'code' => 'ENG',  'description' => 'Software Engineering Department'],
            ['name' => 'Design',           'code' => 'DES',  'description' => 'UI/UX Design Department'],
            ['name' => 'Quality Assurance','code' => 'QA',   'description' => 'QA Testing Department'],
            ['name' => 'Human Resources',  'code' => 'HR',   'description' => 'HR Department'],
            ['name' => 'Marketing',        'code' => 'MKT',  'description' => 'Marketing Department'],
        ];

        foreach ($departments as $dept) {
            Department::create($dept);
        }

        // Create Admin
        User::create([
            'name'          => 'Super Admin',
            'email'         => 'admin@eitms.com',
            'password'      => Hash::make('password'),
            'role'          => 'admin',
            'department_id' => null,
            'is_active'     => true,
        ]);

        // Create Manager
        User::create([
            'name'          => 'John Manager',
            'email'         => 'manager@eitms.com',
            'password'      => Hash::make('password'),
            'role'          => 'manager',
            'department_id' => 1,
            'is_active'     => true,
        ]);

        // Create Employee
        User::create([
            'name'          => 'Jane Employee',
            'email'         => 'employee@eitms.com',
            'password'      => Hash::make('password'),
            'role'          => 'employee',
            'department_id' => 1,
            'is_active'     => true,
        ]);

        // Create Intern
        User::create([
            'name'          => 'Sam Intern',
            'email'         => 'intern@eitms.com',
            'password'      => Hash::make('password'),
            'role'          => 'intern',
            'department_id' => 2,
            'is_active'     => true,
        ]);
    }
}
