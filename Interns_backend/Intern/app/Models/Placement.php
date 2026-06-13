<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Placement extends Model
{
    protected $fillable = [
        'intern_id', 'company_name', 'job_role', 'package_lpa',
        'offer_date', 'joining_date', 'placement_type', 'status',
        'offer_letter', 'notes',
    ];

    protected $casts = [
        'offer_date'   => 'date:Y-m-d',
        'joining_date' => 'date:Y-m-d',
        'package_lpa'  => 'decimal:2',
    ];

    public function intern()
    {
        return $this->belongsTo(Intern::class);
    }
}
